import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
import { VALID_VIEWER_CONFIGS } from '../lib/constants'

let hasHadFirstRoute = false

const Download = () => import('../views/Download.vue')
const Favourites = () => import('../views/Favourites.vue')
const Layers = () => import('../views/Layers.vue')
const Filters = () => import('../views/Filters.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/:config',
    name: 'layers',
    component: Layers,
  },
  {
    path: '/:config/download',
    name: 'download',
    component: Download,
  },
  {
    path: '/:config/favourites',
    name: 'favourites',
    component: Favourites,
  },
  {
    path: '/:config/filters',
    name: 'filters',
    component: Filters,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  const storedConfig = store.getters['app/viewerConfig']
  const config = VALID_VIEWER_CONFIGS.includes(to.params.config)
      ? to.params.config
      : VALID_VIEWER_CONFIGS[0]

  if (!storedConfig) {
    store.commit('app/SET_VIEWER_CONFIG', config)
  }

  if (!to.params.config) {
    return next({ ...to, path: `/${ config }${ to.path }` })
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
