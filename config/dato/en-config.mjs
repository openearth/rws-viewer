import datocmsRequest from './datocms.mjs'
import dumpMenus from './menu-helpers.mjs'
import { MenuWithLayersFragment } from './graphql-fragments.mjs'

const query = /* graphql */ `
${ MenuWithLayersFragment }

query ($first: IntType, $skip: IntType = 0) {
  menus: allMenus(first: $first, skip: $skip) {
    ...menuWithLayers
  }
  _allMenusMeta {
    count
  }
}
`

export default async function dumpENConfig() {
  const { data: { menus } } = await datocmsRequest(process.env.DATO_API_TOKEN, {}, query) 
  dumpMenus(menus, 'en')
}
