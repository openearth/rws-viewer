import { getValidViewerConfigs, getValidViewerNames } from '~/lib/viewer-configs'
import axios from 'axios'

export function getViewerConfiguration(viewer, locale) {
  const viewerConfiguration = getValidViewerConfigs(locale)
    .find(config => config.name === viewer)
  return viewerConfiguration
}

async function getViewerData(viewer, locale) {
  const fileName = `${ viewer }.json`
  const { data } = await axios(`/data/${ locale }/${ fileName }`)
  return data
}
 
const configRepo = {
  async getConfig(viewers, locale) {
    const validViewerNames = getValidViewerNames(locale)

    const validViewers = viewers
      .split(',')
      .filter(viewer => validViewerNames.includes(viewer))

    if (validViewers.length === 0) {
      const viewerToUse = validViewerNames[0]
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
