import axios from 'axios'

const metaRepo = {
  getPredefinedAreas() {
    return axios({
      method: 'get',
      url: 'https://marineprojects.openearth.nl/geoserver/ihm_viewer/wms?typeName=krm2_v&request=GetFeature&Content-Disposition=attachment&filename=krm2_v.csv&srsName=EPSG%3A4258&service=WFS&version=1.1.0&outputFormat=json',
    })
    .then(({ data }) => data.features)
  },
}

export default metaRepo
