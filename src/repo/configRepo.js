const configRepo = {
  getConfig(platform) {
    const fileName = `config-${ platform }`
    const json = require(`./config-files/${ fileName }.json`)
    return json
  },
}

export default configRepo
