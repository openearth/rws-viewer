import dotenv from 'dotenv-safe'
dotenv.config({
  allowEmptyValues: true,
})

import mkdirp from 'mkdirp'
import rimraf from 'rimraf'

import { PUBLIC_DIR } from './constants.mjs'
import dumpApiData from './api.mjs'
import dumpAppConfig from './appconfig.mjs'
import dumpAvailableConfigs from './available-configs.mjs'
import dumpConfig from './config.mjs'

async function run() {
  try {
    rimraf.sync(PUBLIC_DIR)
    await mkdirp(PUBLIC_DIR)

    await Promise.all([
      dumpApiData(),
      dumpAppConfig(),
      dumpAvailableConfigs('en'),
      dumpAvailableConfigs('nl'),
      dumpConfig('en'),
      dumpConfig('nl'),
    ])

    console.log('Dumped all data')
  } catch (e) {
    console.log('Something went wrong during dumping data:', e)
  }
}

run()
