export default {
  namespaced: true,

  state: () => ({
    appNavigationOpen: true,
    appName: '',
  }),

  getters: {},

  actions: {
    setAppName({ commit }, { name }) {
      commit('SET_APP_NAME', { name })
    },
    setNavigationOpen({ commit }, { open }) {
      commit('SET_APP_NAVIGATION_OPEN', { open })
    },
  },

  mutations: {
    SET_APP_NAME(state, { name }) {
      state.appName = name
    },
    SET_APP_NAVIGATION_OPEN(state, { open }) {
      state.appNavigationOpen = open
    },
  },
}
