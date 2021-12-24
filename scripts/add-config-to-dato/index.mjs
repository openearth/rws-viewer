import path from 'node:path'
import { promises as fs } from 'node:fs'
import { map, pipe, not, prop, flatten, uniq, filter, forEach, props, keys } from 'ramda'
import { flattenLayers } from '../../src/lib/layer-helpers.js'
import { removeIdsFromStructure, replaceLayerWithId } from './menu-helpers.mjs'
import { getTagsFromDato, getLayersFromDato, addTagToDato, addLayerToDato, addStructureToDato } from './dato.mjs'

const addPairToObject = obj => ([ key, value ]) => obj[key] = value
const asyncMap = fn => list => Promise.all(list.map(fn))
const logErrorAndExit = error => console.log(error.message) && process.exit(1)
const absolutePath = file => /^\//.test(file) ? file : path.join(process.cwd(), file)
const readFile = path => fs.readFile(absolutePath(path), { encoding: 'utf-8' })
const readJsonFile = path => readFile(path).then(convertToJson).catch(logErrorAndExit)
const convertToJson = string => JSON.parse(string)
const renameProp = (oldname, newname) => ({ [oldname]: value, ...obj }) => ({ ...obj, [newname]: value })
const existIn = list => value => list.includes(value)
const notExistIn = list => pipe(existIn(list), not)
const replaceTagsWithTagIds = layer => layer.tags = layer.tags.map(tag => tagIdMap[tag] || tag)

const configFilePath = process.argv?.[2]
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('--d')
const isHelp = process.argv.includes('--help') || process.argv.includes('-h')

if (isHelp) {
  console.log('Add config files to dato')
  console.log('')
  console.log('Usage: ')
  console.log('')
  console.log('npm run add-config-to-dato -- --help            Display this help message')
  console.log('npm run add-config-to-dato -- <file>            Adds the <file> contents to Dato as layers and folder structure')
  console.log('npm run add-config-to-dato -- <file> --dry-run  Only show stats without adding content to Dato')
  process.exit(0)
}

if (!configFilePath) {
  console.log('')
  console.log('No config file provided.')
  console.log('Usage:')
  console.log('')
  console.log('  npm run add-config-to-dato -- relative/path/to/config.json')
  process.exit(1)
}

const config = await readJsonFile(configFilePath)
  .then(renameProp('layers', 'children'))
  .then(removeIdsFromStructure)
  .catch(error => {
    console.log(error.message)
    process.exit(1)
  })

const tagsPromise = getTagsFromDato()
const layersPromise = getLayersFromDato()

const tagIdMap = {}
const layerIdMap = {}
const [ tagsInDato, layersInDato ] = await Promise.all([ tagsPromise, layersPromise ])
const layersInConfig = flattenLayers(config)
const tagsInConfig = pipe(map(prop('tags')), flatten, uniq)(layersInConfig)
const tagNamesInDato = map(prop('title'))(tagsInDato)
const newTags = filter(notExistIn(tagNamesInDato))(tagsInConfig)

tagsInDato.forEach(
  pipe(
    props([ 'title', 'id' ]),
    addPairToObject(tagIdMap),
  ),
)

layersInDato.forEach(
  pipe(
    props([ 'url', 'layer', 'id' ]),
    ([ url, layer, id ]) => [ `${ url }:${ layer }`, id ],
    addPairToObject(layerIdMap),
  ),
)

const newLayers = filter(
    pipe(
      props([ 'url', 'layer' ]),
      ([ url, layer ]) => `${ url }:${ layer }`,
      notExistIn(keys(layerIdMap)),
    ),
  )(layersInConfig)

if (isDryRun === false) {
  await asyncMap(addTagToDato)(newTags)
    .then(
      forEach(
        pipe(
          props([ 'title', 'id' ]),
          addPairToObject(tagIdMap),
        ),
      ),
    )
}

layersInConfig.forEach(replaceTagsWithTagIds)

if (isDryRun === false) {
  await asyncMap(addLayerToDato)(newLayers)
    .then(
      forEach(
        pipe(
          props([ 'url', 'layer', 'id' ]),
          ([ url, layer, id ]) => ([ `${ url }:${ layer }`, id ]),
          addPairToObject(layerIdMap),
        ),
      ),
    )
}

if (isDryRun === false) {
  replaceLayerWithId(layerIdMap)(config)
  await addStructureToDato(config)
}

console.log(`Total new tags: ${ newTags.length }`)
console.log(`Total new layers: ${ newLayers.length }`)
