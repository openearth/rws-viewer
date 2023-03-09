import { stringify } from 'query-string'

const scale = 0.75
const viewport = {
  width: 1122 / scale,
  height: 792 / scale,
}

export const handler = async (event) => {
  const { layers, viewer, lat, lng, center, zoom } = event.queryStringParameters

  try {
    let browser

    if (process.env.NETLIFY_DEV) {
      const playwright = await import('playwright-chromium')
      browser = await playwright.chromium.launch({
        headless: true, 
      })
    } else {
      const playwright = await import('playwright-aws-lambda')
      browser = await playwright.launchChromium()
    }

    const page = await browser.newPage({
      viewport,
    })

    page.on('pageerror', console.error)

    const query = stringify({
      print: 'noui',
      layers,
      lat,
      lng,
      center,
      zoom: zoom,
    })

    await page.goto(
      `${ process.env.URL }/${ viewer }/?${ query }`,
      { waitUntil: 'networkidle' },
    )

    // this somehow solves the issue of a blank page being returned as pdf
    await new Promise((res) => setTimeout(() => res(), 1000))

    const pdf = await page.pdf({ format: 'a4', scale, landscape: true })

    await page.close()

    await browser.close()

    return {
      statusCode: 200,
      body: JSON.stringify({
        pdf: pdf.toString('base64'),
      }),
    }
  } catch (e) {
    console.log('error', e)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Someting went wrong',
      }),
    }
  }
}
