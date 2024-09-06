import path from 'path'
import { URL } from 'url'
import dotenv from 'dotenv-safe'

dotenv.config()

const __dirname = new URL('.', import.meta.url).pathname
export const PUBLIC_DIR = path.join(__dirname, '../..', 'public/data')
export const datoEnvironment = process.env.DATO_ENVIRONMENT
