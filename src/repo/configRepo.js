import { VALID_PLATFORMS } from '~/lib/constants'

const configRepo = {
  getConfig(platform) {
    const isValidPlatform = platform && VALID_PLATFORMS.includes(platform)
    const platformToUse = isValidPlatform ? platform : VALID_PLATFORMS[0]

    if (!isValidPlatform) {
      console.warn(`No (valid) platform provided in the query string, falling back to ${ platformToUse }`)
    }

    const fileName = `config-${ platformToUse }`
    const json = require(`./config-files/${ fileName }.json`)
    return json
  },
}

export default configRepo
