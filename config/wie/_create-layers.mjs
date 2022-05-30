import fs from 'fs'
import axios from 'axios'
import path from 'path'

const __dirname = new URL('.', import.meta.url).pathname
const PUBLIC_DIR = path.join(__dirname, '../..', 'public/data')
const title = 'wie'

const filterData = [ 'species' ]

function getAquadeskData() {
  const filterMap = {
    species: 'parameter',
  }

  return {
    id: 'aquadesk',
    name: 'Aquadesk',
    url: 'https://ddecoapi.aquadesk.nl/v2​/measurements​/geojson',
    layer: '',
    downloadUrl: 'https://ddecoapi.aquadesk.nl/v2​/measurements​/geojson',
    downloadLayer: '',
    timeFilter: false,
    columnFilter: null,
    tags: [],
    filterData,
    filterMap,
    metadata: [],
  }
}

function getSovonData() {
  const filterMap = {
    species: 'taxonname',
  }

  return {
    id: 'sovon',
    name: 'Sovon',
    url: 'https://dd-eco-api-test.sovon.nl/api/v2/measurement/',
    layer: '',
    downloadUrl: 'https://dd-eco-api-test.sovon.nl/api/v2/measurement/',
    downloadLayer: '',
    timeFilter: false,
    columnFilter: null,
    tags: [],
    filterData,
    filterMap,
    metadata: [],
  }
}

function getWmrData() {
  const filterMap = {
    species: 'a_scient_name',
  }

  return {
    id: 'wmr',
    name: 'Wmr',
    url: 'https://api.aqp.wurcloud.nl/v1/measurements',
    layer: '',
    downloadUrl: 'https://api.aqp.wurcloud.nl/v1/measurements',
    downloadLayer: '',
    timeFilter: false,
    columnFilter: null,
    tags: [],
    filterData,
    filterMap,
    metadata: [],
  }
}

async function createLayers() {
  const aquadeskData = getAquadeskData()
  const sovonData = getSovonData()
  const wmrData = getWrmData()

  const data = {
    'id': '87633356',
    'name': 'WIE',
    'metadata': [],
    'children': [
      aquadeskData,
      sovonData,
      wmrData
    ],
  }

  console.log(data)

  fs.writeFile(
    `${ PUBLIC_DIR }/${ title }.json`,
    JSON.stringify(data, null, 2),
    () => {}
  )
}

createLayers()
