import { VALID_VIEWER_CONFIGS, VALID_VIEWER_NAMES } from '~/lib/constants'
import axios from 'axios'

export function getViewerConfiguration(viewer) {
  const viewerConfiguration = VALID_VIEWER_CONFIGS.find(config => config.name === viewer)
  return viewerConfiguration
}

async function getViewerData(viewer, locale) {
  const fileName = `${ viewer }.json`
  const { data } = await axios(`/data/${ locale }/${ fileName }`)
  return data
}
 
const configRepo = {
  async getConfig(viewers, locale) {
    const validViewers = viewers
      .split(',')
      .filter(viewer => VALID_VIEWER_NAMES.includes(viewer))

    if (validViewers.length === 0) {
      const viewerToUse = VALID_VIEWER_NAMES[0]
      validViewers.push(viewerToUse)
      console.warn(`No (valid) viewer provided, falling back to ${ viewerToUse.name }`)
    }

    return Promise.all(validViewers.map((viewer) => getViewerData(viewer, locale)))
      .then(viewersData => {
        return {
          name: viewersData[0].name,
          layers: viewersData,
        }
      })
  },
}

export default configRepo
