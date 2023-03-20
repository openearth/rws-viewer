import dotenv from 'dotenv-safe'
dotenv.config()

import mkdirp from 'mkdirp'
import rimraf from 'rimraf'

import { PUBLIC_DIR } from './constants.mjs'
import dumpApiData from './api.mjs'
import dumpAppConfig from './appconfig.mjs'
import dumpAvailableConfigs from './available-configs.mjs'
import dumpENConfig from './en-config.mjs'
import dumpNLConfig from './nl-config.mjs'

async function run() {
  try {
    rimraf.sync(PUBLIC_DIR)
    await mkdirp(PUBLIC_DIR)

    await Promise.all([
      dumpApiData(),
      dumpAppConfig(),
      dumpAvailableConfigs(),
      dumpENConfig(),
      dumpNLConfig(),
    ])

    console.log('Dumped all data')
  } catch (e) {
    console.log('Something went wrong during dumping data:', e)
  }
}

run()
