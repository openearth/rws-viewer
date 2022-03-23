import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
import { VALID_VIEWER_CONFIGS } from '../lib/constants'

const validViewerConfigNames = VALID_VIEWER_CONFIGS.map(({ name }) => name)
let hasHadFirstRoute = false

const Download = () => import('../views/Download.vue')
const Favourites = () => import('../views/Favourites.vue')
const Layers = () => import('../views/Layers.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/:configNames',
    name: 'layers',
    component: Layers,
  },
  {
    path: '/:configNames/download',
    name: 'download',
    component: Download,
  },
  {
    path: '/:configNames/favourites',
    name: 'favourites',
    component: Favourites,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  const storedConfigNames = store.getters['app/viewerConfigNames']

  const configNames = validViewerConfigNames.includes(to.params.configNames)
      ? to.params.configNames
      : validViewerConfigNames[0]

  if (!storedConfigNames) {
    store.commit('app/SET_VIEWER_CONFIG_NAMES', configNames)
  }

  if (!to.params.configNames) {
    return next({ ...to, path: `/${ configNames }${ to.path }` })
  }

  next()
})

router.beforeEach((to, from, next) => {
  const rasterLayerIds = store.getters['map/rasterLayerIds']
  const layers = rasterLayerIds.join(',')

  if (hasHadFirstRoute === false) {
    hasHadFirstRoute = true
    return next()
  }

  if (!!to.query.layers !== !!layers) {
    next({ ...to, query: { layers } })
  } else {
    next()
  }
})

export default router
