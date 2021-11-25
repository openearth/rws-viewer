export default {
  namespaced: true,

  state: () => ({
    appNavigationOpen: true,
    appNavigationWidth: 440,
    appName: '',
  }),

  getters: {
    appNavigationOpen: state => state.appNavigationOpen,
    appNavigationWidth: state => state.appNavigationWidth,
    appName: state => state.appName,
  },

  mutations: {
    SET_APP_NAME(state, { name }) {
      state.appName = name
    },
    SET_APP_NAVIGATION_OPEN(state, { open }) {
      state.appNavigationOpen = open
    },
  },

  actions: {
    setAppName({ commit }, { name }) {
      document.title = name
      commit('SET_APP_NAME', { name })
    },

    setNavigationOpen({ commit }, { open }) {
      commit('SET_APP_NAVIGATION_OPEN', { open })
    },
  },
}
