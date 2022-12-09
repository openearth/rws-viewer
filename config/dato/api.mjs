import fs from 'fs/promises'

export default function handleApiConfig(options) {
  const { publicDir } = options

  return async function execute({ data }) {
    fs.writeFile(`${ publicDir }/api.json`, JSON.stringify(data, null, 2))
  }
}
