import fs from 'fs/promises'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { split, map, pipe } from 'ramda'
import inquirer from 'inquirer'
import slugify from '@sindresorhus/slugify'
import childProcess from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

const filesFolder = path.join(__dirname, '../../public/translations')

const files = await fs.readdir(filesFolder)
const enContents = JSON.parse(await fs.readFile(path.join(filesFolder, 'en.json')))
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

function pbcopy(data) {
  var proc = childProcess.spawn('pbcopy') 
  proc.stdin.write(data); proc.stdin.end()
}

const answers = await inquirer.prompt([
  ...availableLocales.map(locale => ({
    name: locale,
    type: 'input',
    message: `The translation in ${ locale.toUpperCase() }`,
  })),
  { name: 'key', type: 'input', message: 'What key do you want to use?', default: ({ en }) => toCamelCase(en), validate: value => Object.keys(enContents).indexOf(value) === -1 || `The key ${ value } already exists` },
  { name: 'sure', type: 'confirm', message: 'Do you want to update the locale files?' },
  { 
    name: 'copy',
    type: 'list',
    message: 'What should we copy to your clipboard?',
    default: 0,
    choices: ({ key }) => [
      `{{ $t('${ key }') }}`,
      `$t('${ key }')`,
      `this.$t('${ key }')`,
      { name: 'Don\'t copy to clipboard', value: undefined } ],      
    },
])

if (answers.sure === false) {
  console.log('')
  console.log('No files are updated!')
  console.log('')
  process.exit(0)
}

await Promise.all(files.map(async file => {
  const locale = file.replace('.json', '')
  const filePath = path.join(filesFolder, file)
  const content = await fs.readFile(filePath)
  const json = JSON.parse(content)
  json[answers.key] = answers[locale]
  const sortedJson = Object.keys(json).sort().reduce((collection, key) => ({ ...collection, [key]: json[key] }), {})
  const updatedContent = JSON.stringify(sortedJson, null, 2)
  await fs.writeFile(filePath, `${ updatedContent }\n`, { encoding: 'utf-8' })
}))
.then(() => {
  console.log('')
  console.log('All locale files are updated.')
  console.log('')
  if (answers['copy']) {
    pbcopy(answers['copy'])
    console.log(`${ answers['copy'] } is copied to your clipboard`)
    console.log('')
  } else {
  console.log('')
  console.log('Use the new key like this:')
  console.log('')
  console.log(`  $t('${ answers.key }')`)
  console.log('')
  }
})
.catch(error => {
  console.log('Something went wrong:')
  console.log(error)
})
