export default {
  namespaced: true,

  state: () => ({
    appNavigationOpen: true,
    appNavigationWidth: 500,
    viewerConfig: '',
    viewerName: '',
    viewerPrivacyStatement: '',
    viewerUserAgreement: '',
    acknowledgments: '',
    viewerLogo: '',
  }),

  getters: {
    appNavigationOpen: state => state.appNavigationOpen,
    appNavigationWidth: state => state.appNavigationWidth,
    viewerName: state => state.viewerName,
    viewerConfig: state => state.viewerConfig,
    viewerPrivacyStatement: state => state.viewerPrivacyStatement,
    viewerUserAgreement: state => state.viewerUserAgreement,
    acknowledgments: state => state.acknowledgments,
    viewerLogo: state => state.viewerLogo,
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
    SET_VIEWER_PRIVACY_STATEMENT(state, { privacyStatement }) {
      state.viewerPrivacyStatement = privacyStatement
    },
    SET_VIEWER_USER_AGREEMENT(state, { userAgreement }) {
      state.viewerUserAgreement = userAgreement
    },
    SET_VIEWER_ACKNOWLEDGMENTS(state, { acknowledgments }) {
      state.acknowledgments = acknowledgments
    },
    SET_VIEWER_LOGO(state, { logo }) {
      state.viewerLogo = logo
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

    setViewerPrivacyStatement({ commit }, { privacyStatement }) {
      commit('SET_VIEWER_PRIVACY_STATEMENT', { privacyStatement })
    },

    setViewerUserAgreement({ commit }, { userAgreement }) {
      commit('SET_VIEWER_USER_AGREEMENT', { userAgreement })
    },

    setViewerAcknowledgments ( { commit }, { acknowledgments }) {
      commit('SET_VIEWER_ACKNOWLEDGMENTS', { acknowledgments })
    },

    setViewerLogo({ commit }, { logo }) {
      commit('SET_VIEWER_LOGO', { logo })
    },
  },
}
