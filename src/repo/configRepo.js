import { VALID_VIEWER_CONFIGS } from '~/lib/constants'
import axios from 'axios'

async function getViewerData(viewer) {
  const fileName = `${ viewer }.json`
  const { data } = await axios(`/data/${ fileName }`)
  return data
}

const configRepo = {
  async getConfig(viewers) {
    const validViewers = viewers
      .split(',')
      .filter(viewer => VALID_VIEWER_CONFIGS.includes(viewer))

    if (validViewers.length === 0) {
      const viewerToUse = VALID_VIEWER_CONFIGS[0]
      validViewers.push(viewerToUse)
      console.warn(`No (valid) viewer provided, falling back to ${ viewerToUse.name }`)
    }

    return Promise.all(validViewers.map(getViewerData))
      .then(viewersData => {
        return {
          name: viewersData[0].name,
          layers: viewersData,
        }
      })
  },
}

export default configRepo
