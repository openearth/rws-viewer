import fs from 'fs/promises'
import slugify from '@sindresorhus/slugify'



export default function handleAvailableConfigs(options) {
  const { publicDir } = options

  return async function execute({ data }) {
    const { configs } = data
    const availableConfigs = configs.map(config => slugify(config.name))

    fs.writeFile(
      `${ publicDir }/available-configs.json`,
      JSON.stringify(availableConfigs, null, 2),
    )

  }
}

