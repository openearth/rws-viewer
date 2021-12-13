import { VALID_VIEWER_CONFIGS } from '~/lib/constants'
import axios from 'axios'

const configRepo = {
  async getConfig(platform) {
    const isValidPlatform = platform && VALID_VIEWER_CONFIGS.includes(platform)
    const platformToUse = isValidPlatform ? platform : VALID_VIEWER_CONFIGS[0]

    if (!isValidPlatform) {
      console.warn(`No (valid) platform provided, falling back to ${ platformToUse }`)
    }

    const fileName = `${ platformToUse }.json`
    const { data } = await axios(`/data/${ fileName }`)
    return data
  },
}

export default configRepo
