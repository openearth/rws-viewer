import fs from 'fs/promises'
import { PUBLIC_DIR } from './constants.mjs'
import datocmsRequest from './datocms.mjs'

const query = /* graphql */ `
query {
  apis: allExternalApis {
    layers {
      layer {
        name
        id
        url
        layer
        downloadUrl
        downloadLayer
        timeFilter
        columnFilter
      }
    }
    name
    id
  }
}`

export default async function dumpApiData() {
  const { data } = await datocmsRequest(process.env.DATO_API_TOKEN, {}, query)
  await fs.writeFile(`${ PUBLIC_DIR }/api.json`, JSON.stringify(data, null, 2))
}
