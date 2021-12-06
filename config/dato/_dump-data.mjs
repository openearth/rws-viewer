import fs from 'fs/promises'
import path from 'path'
import { URL } from 'url'
import dotenv from 'dotenv-safe'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import queryApi from './_query-api.mjs'

dotenv.config()

const __dirname = new URL('.', import.meta.url).pathname
const PUBLIC_DIR = path.join(__dirname, '../..', 'public/data')

const readFile = file => fs.readFile(file, { encoding: 'utf-8' })

function fetchDataFromQueryFile(variables = {}) {
  return async function execute(queryFile) {
    const handlerFile = queryFile.replace('.graphql', '.mjs')
    let processData = () => {}
    try {
      const { default: module } = await import(handlerFile)
      processData = data =>
        module({ publicDir: PUBLIC_DIR })(data)
    } catch (error) {
      const fileName = queryFile.replace(__dirname, '' )
      console.log(
        `WARNING: ${ fileName } does not have handler file. Add ${ queryFile.replace('.graphql', '.mjs') }`,
      )
      console.log(error)
    }

    return readFile(queryFile)
      .then(queryApi(process.env.DATO_API_TOKEN, variables))
      .then(processData)
      .catch(error => {
        console.log(`Error handling ${ queryFile.replace(__dirname, '') }`)
        console.trace(error.message)
      })
  }
}

rimraf.sync(PUBLIC_DIR)
await mkdirp(PUBLIC_DIR)

const queries = (await fs.readdir(__dirname))
  .filter(file => file.includes('.graphql'))
  .map(file => path.join(__dirname, file))
  .map(fetchDataFromQueryFile({}))


Promise.all(queries)
  .then(() => console.log('Parsed all queries'))
