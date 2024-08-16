import fs from 'fs/promises'
import slugify from '@sindresorhus/slugify'
import datocmsRequest from './datocms.mjs'
import { PUBLIC_DIR } from './constants.mjs'

const query = /* graphql */ `
query {
  appConfig {
    categories {
      name
    }
  }
}
`

export default async function dumpAppConfig() {
  const { data: { appConfig } } = await datocmsRequest(process.env.DATO_API_TOKEN, {}, query)
  
  const categories = appConfig?.categories.map((category) =>
    slugify(category.name),
  ) || []

  const config = {
    ...appConfig,
    categories,
  }

  await fs.writeFile(`${ PUBLIC_DIR }/app.json`, JSON.stringify(config, null, 2))
}
