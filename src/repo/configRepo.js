import { VALID_VIEWER_CONFIGS } from '~/lib/constants'
import axios from 'axios'

function getViewerDataFromApi(path) {
  console.log(path)
}

function getViewerDataFromFile(path) {
  return axios(path)
    .then(({ data }) => data)
}

function getViewerDataFromDato(viewerName) {
  const fileName = `${ viewerName }.json`
  return getViewerDataFromFile(`/datoData/${ fileName }`)
}

function getViewerData(viewerConfig) {
  switch (viewerConfig.source) {
    case 'dato':
      return getViewerDataFromDato(viewerConfig.name)
    case 'file':
      return getViewerDataFromFile(viewerConfig.path)
    case 'api':
      return getViewerDataFromApi(viewerConfig.path)
  }
}

const configRepo = {
  async getConfig(viewerNames) {
    const validViewerConfigs = viewerNames
      .split(',')
      .map(viewerName => VALID_VIEWER_CONFIGS.find(({ name }) => name === viewerName))
      .filter(Boolean)

    // @TODO :: This doesn't change the route, perhaps do this check in route guard?
    if (validViewerConfigs.length === 0) {
      const viewerConfigToUse = VALID_VIEWER_CONFIGS[0]
      validViewerConfigs.push(viewerConfigToUse)
      console.warn(`No (valid) viewer provided, falling back to ${ viewerConfigToUse.name }`)
    }
    return Promise.all(validViewerConfigs.map(getViewerData))
      .then(viewersData => {
        return {
          name: viewersData[0].name,
          layers: viewersData,
        }
      })
  },
}

export default configRepo
