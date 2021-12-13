import fs from 'fs/promises'
import slugify from '@sindresorhus/slugify'

export default function handleAppConfig(options) {
  const { publicDir } = options

  return async function execute({ data }) {
    const { appConfig } = data
    const categories = appConfig.categories.map(category => slugify(category.name))

    const config = {
      ...appConfig,
      categories,
    }

    fs.writeFile(
      `${ publicDir }/app.json`,
      JSON.stringify(config, null, 2),
    )

  }
}
