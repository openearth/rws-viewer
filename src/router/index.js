import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

let hasHadFirstRoute = false

const Download = () => import('../views/Download.vue')
const Favourites = () => import('../views/Favourites.vue')
const Layers = () => import('../views/Layers.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'layers',
    component: Layers,
  },
  {
    path: '/download',
    name: 'download',
    component: Download,
  },
  {
    path: '/favourites',
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