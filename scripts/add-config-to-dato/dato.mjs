import { SiteClient } from 'datocms-client'
import { config } from 'dotenv-safe'
config()
const client = new SiteClient(process.env.DATO_API_TOKEN_FULL_ACCESS)
const TAG_TYPE = '1518135'
const LAYER_TYPE = '1518125'
const MENU_TYPE = '1518226'

const getAllItemsForType = type => () => 
  client.items.all({ filter: { type } }, {
    allPages: true,
  })


export const getTagsFromDato = getAllItemsForType(TAG_TYPE)
export const getLayersFromDato = getAllItemsForType(LAYER_TYPE)

export function addTagToDato(title) {
  // console.log(`Adding tag "${ title }" to Dato`)
  return client.items.create({
    itemType: TAG_TYPE,
    title,
  })
  .catch(error => {
    console.log(`Failed to add tag: ${ title }`)
    console.log(error.message)
    process.exit(1)
  })
}

export function addLayerToDato(layer) {
  // console.log(`Adding layer "${ layer.name }" to Dato`)
  return client.items.create({
    itemType: LAYER_TYPE,
    ...layer,
  })
  .catch(error => {
    console.log(`Failed to add layer: ${ layer.name }`)
    console.log(error.message)
    process.exit(1)
  })
}

export async function addStructureToDato(layer, parentId) {
  if (layer.children) {
    const childLayers = layer.children.filter(child => typeof child === 'string')
    const childStructure = layer.children.filter(child => child.name)

    // console.log(`Adding menu item "${ layer.name }" to Dato`)
    const item = await client.items.create({
      itemType: MENU_TYPE,
      name: layer.name,
      ...(childLayers.length ? { layers: childLayers } : {}),
      ...(parentId ? { parentId } : {}),
    })
    .catch(error => {
      console.log(`Failed to add menu item: ${ layer.name }`)
      console.log(error.message)
      process.exit(1)
    })

    if (childStructure.length) {
      const promises = childStructure
        .map(child => addStructureToDato(child, item.id))

      await Promise.all(promises)
    }
  }
}

// const deleteType = type => getAllItemsForType(type)()
//   .then(items => items.map(({ id }) => id))
//   .then(ids => client.item.bulkDestroy({ items: ids }))

// console.log('deleting all tags')
// await deleteType(TAG_TYPE).catch(console.log)
// console.log('deleting all layers')
// await deleteType(LAYER_TYPE).catch(console.log)
// console.log('deleting all menus')
// await deleteType(MENU_TYPE).catch(console.log)
