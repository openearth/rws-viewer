const path = require('path')

module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: '@import \'~@/components/AppCore/variables.scss\';',
      },
    },
  },
  configureWebpack: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src/'),
      },
    },
  },
}
