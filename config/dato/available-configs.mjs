import fs from 'fs/promises'
import slugify from '@sindresorhus/slugify'

export default function handleAvailableConfigs(options) {
  const { publicDir } = options

  return async function execute({ data }) {
    const { configs } = data
   
    const availableConfigs = configs.map(config => {
      return {
        name: slugify(config.name),
        mapZoom: config.mapZoom,
        mapCenter: config.mapCenter,
        defaultLayer: config.defaultLayer,
      }
    })
  
    fs.writeFile(
      `${ publicDir }/available-configs-viewers.json`,
      JSON.stringify(availableConfigs, null, 2),
    )

  }
}
