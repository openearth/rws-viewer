import datocmsRequest from './datocms.mjs'
import dumpMenus from './menu-helpers.mjs'
import { MenuWithLayersFragment } from './graphql-fragments.mjs'

const query = /* graphql */ `
${ MenuWithLayersFragment }

query ($first: IntType, $skip: IntType = 0, $locale: SiteLocale) {
  menus: allMenus(first: $first, skip: $skip, locale: $locale) {
    ...menuWithLayers
  }
  _allMenusMeta {
    count
  }
}
`

export default async function dumpNLConfig() {
  const { data: { menus } } = await datocmsRequest(process.env.DATO_API_TOKEN, {
    locale: 'nl',
  }, query) 
  dumpMenus(menus, 'nl')
}
