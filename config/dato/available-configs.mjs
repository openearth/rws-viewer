import fs from 'fs/promises'
import slugify from '@sindresorhus/slugify'
import { PUBLIC_DIR } from './constants.mjs'
import datocmsRequest from './datocms.mjs'

const query = /* graphql */ `
query {
  configs: allMenus(filter: { parent: { exists: false } }) {
    name
    mapZoom
    mapCenter
    defaultLayer {
      id
    }
    privacyStatement
    userAgreement
    piwikContainerId
  }
}
`

export default async function dumpAvailableConfigs() {
  const { data: { configs } } = await datocmsRequest(
    process.env.DATO_API_TOKEN,
    {},
    query,
  )

  const availableConfigs = configs.map((config) => {
    return {
      name: slugify(config.name),
      mapZoom: config.mapZoom,
      mapCenter: config.mapCenter,
      defaultLayer: config.defaultLayer,
      privacyStatement: config.privacyStatement,
      userAgreement: config.userAgreement,
      piwikContainerId: config.piwikContainerId,
    }
  })

  await fs.writeFile(
    `${ PUBLIC_DIR }/available-configs-viewers.json`,
    JSON.stringify(availableConfigs, null, 2),
  )
}
