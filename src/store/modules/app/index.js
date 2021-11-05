export default {
  namespaced: true,

  state: () => ({
    appNavigationOpen: true,
  }),

  getters: {},

  actions: {
    setNavigationOpen({ commit }, { open }) {
      commit('SET_APP_NAVIGATION_OPEN', { open })
    },
  },

  mutations: {
    SET_APP_NAVIGATION_OPEN(state, { open }) {
      state.appNavigationOpen = open
    },
  },
}
