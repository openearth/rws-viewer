export const handler = async (event) => {
  try {
    let browser

    if (process.env.NETLIFY_DEV) {
      const playwright = await import('playwright-chromium')
      browser = await playwright.chromium.launch({ headless: true })
    } else {
      const playwright = await import('playwright-aws-lambda')
      browser = await playwright.launchChromium()
    }

    const page = await browser.newPage()
    page.on('pageerror', console.error)

    await page.goto(
      `${ process.env.URL }/wadden-viewer/?layers=97439193&folders=143810679&print=noui`,
      { waitUntil: 'networkidle' },
    )

    // this somehow solves the issue of a blank page being returned as pdf
    await new Promise((res) => setTimeout(() => res(), 1000))

    const pdf = await page.pdf({ format: 'A4' })

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
