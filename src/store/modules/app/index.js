export default {
  namespaced: true,

  state: () => ({
    appNavigationOpen: true,
    appNavigationWidth: 500,
    viewerConfig: '',
    viewerName: '',
    printMode: '',
  }),

  getters: {
    appNavigationOpen: state => state.appNavigationOpen,
    appNavigationWidth: state => state.appNavigationWidth,
    viewerName: state => state.viewerName,
    viewerConfig: state => state.viewerConfig,
    printMode: state => state.printMode,
  },

  mutations: {
    SET_VIEWER_NAME(state, { name }) {
      state.viewerName = name
    },
    SET_APP_NAVIGATION_OPEN(state, { open }) {
      state.appNavigationOpen = open
    },
    SET_VIEWER_CONFIG(state, config) {
      state.viewerConfig = config
    },
    SET_PRINT_MODE(state, { printMode }) {
      state.printMode = printMode
    },
    SET_APP_NAVIGATION_WIDTH(state, { width }) {
      state.appNavigationWidth = width
    },
  },

  actions: {
    setViewerName({ commit }, { name }) {
      document.title = name
      commit('SET_VIEWER_NAME', { name })
    },

    setNavigationOpen({ commit }, { open }) {
      commit('SET_APP_NAVIGATION_OPEN', { open })
    },

    setPrintMode({ commit }, { printMode }) {
      commit('SET_PRINT_MODE', { printMode })
    },

    setAppNavigationWidth({ commit }, { width }) {
      commit('SET_APP_NAVIGATION_WIDTH', { width })
    },
  },
}
