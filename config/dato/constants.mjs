import path from 'path'
import { URL } from 'url'

const __dirname = new URL('.', import.meta.url).pathname
export const PUBLIC_DIR = path.join(__dirname, '../..', 'public/data')
