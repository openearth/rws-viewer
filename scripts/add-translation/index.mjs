import fs from 'fs/promises'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { split, map, pipe } from 'ramda'
import inquirer from 'inquirer'
import slugify from '@sindresorhus/slugify'

const __dirname = dirname(fileURLToPath(import.meta.url))

const files = await fs.readdir(path.join(__dirname, 'public/translations'))
const availableLocales = files.map(file => file.replace('.json', ''))
const capitaliseFirstLetter = ([ first, ...rest ]) => first.toUpperCase() + rest.join('')
const lowerCaseFirstLetter =  ([ first, ...rest ]) => first.toLowerCase() + rest.join('')

console.clear()

const toCamelCase = pipe(
  slugify,
  split('-'),
  map(capitaliseFirstLetter),
  lowerCaseFirstLetter,
)

const answers = await inquirer.prompt([
  ...availableLocales.map(locale => ({
    name: locale,
    type: 'input',
    message: `The translation in ${ locale.toUpperCase() }`,
  })),
  { name: 'key', type: 'input', message: 'What key do you want to use?', default: ({ en }) => toCamelCase(en) },
  { name: 'sure', type: 'confirm', message: 'Do you want to update the locale files?' },
])

if (answers.sure === false) {
  console.log('')
  console.log('No files are updated!')
  console.log('')
  process.exit(0)
}

await Promise.all(files.map(async file => {
  const locale = file.replace('.json', '')
  const filePath = path.join(__dirname, `public/translations/${ file }`)
  const content = await fs.readFile(filePath)
  const json = JSON.parse(content)
  json[answers.key] = answers[locale]
  const updatedContent = JSON.stringify(json, null, 2)
  await fs.writeFile(filePath, `${ updatedContent }\n`, { encoding: 'utf-8' })
}))
.then(() => {
  console.log('')
  console.log('All locale files are updated.')
  console.log('Use the new key like this:')
  console.log('')
  console.log(`  $t("${ answers.key }")`)
  console.log('')
})
.catch(error => {
  console.log('Something went wrong:')
  console.log(error)
})
