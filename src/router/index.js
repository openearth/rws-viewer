
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
import { getValidViewerNames } from '../lib/viewer-configs'
import { i18n } from '../plugins/i18n'

let hasHadFirstRoute = false

const Download = () => import('../views/Download.vue')
const Favourites = () => import('../views/Favourites.vue')
const Layers = () => import('../views/Layers.vue')
const Filters = () => import('../views/Filters.vue')
const DownloadGeoserver = () => import('../views/DownloadGeoserver.vue')
const DownloadApi = () => import('../views/DownloadApi.vue')
const DownloadBeaconApi = () => import('../views/DownloadBeaconApi.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/:config',
    name: 'layers',
    component: Layers,
  },
  {
    path: '/:config/download',
    component: Download,
    children: [
      {
        path: '/',
        redirect: 'geoserver',
      },
      {
        path: 'geoserver',
        name: 'download.geoserver',
        component: DownloadGeoserver,
      },
      {
        path: 'api',
        name: 'download.api',
        component: DownloadApi,
      },
      {
        path: 'beaconapi',
        name: 'download.beaconapi',
        component: DownloadBeaconApi,
      },
    ],
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
  const locale = i18n.locale
  const storedConfig = store.getters['app/viewerConfig']
  const validViewerNames = getValidViewerNames(locale)
  const config = validViewerNames.includes(to.params.config)
    ? to.params.config
    : validViewerNames[0]

  if (!storedConfig) {
    store.commit('app/SET_VIEWER_CONFIG', config)
  }

  if (!to.params.config) {
    return next({ ...to, path: `/${ config }${ to.path }` })
  } 
    
  next()
})

router.beforeEach((to, from, next) => {
  const activeFlattenedLayerIds = store.getters['map/activeFlattenedLayerIds']
  const layers = activeFlattenedLayerIds.join(',')

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
