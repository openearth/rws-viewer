import fs from 'fs/promises'
import slugify from '@sindresorhus/slugify'
import { PUBLIC_DIR } from './constants.mjs'
import datocmsRequest from './datocms.mjs'

const query = /* graphql */ `
query($locale: SiteLocale) {
  configs: allMenus(filter: { parent: { exists: false } }, locale: $locale) {
    name
    mapZoom
    mapCenter
    defaultLayer {
      id
    }
    privacyStatement
    userAgreement
    acknowledgments
    logo
  }
}
`

export default async function dumpAvailableConfigs(locale) {
  const { data: { configs } } = await datocmsRequest(
    { locale },
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
      acknowledgments: config.acknowledgments,
      logo: config.logo
    }
  })

  await fs.mkdir(`${ PUBLIC_DIR }/${ locale }`, { recursive: true })

  await fs.writeFile(
    `${ PUBLIC_DIR }/${ locale }/available-configs-viewers.json`,
    JSON.stringify(availableConfigs, null, 2),
  )
}
