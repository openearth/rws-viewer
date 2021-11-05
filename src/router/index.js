import Vue from 'vue'
import VueRouter from 'vue-router'

const Download = () => import('../views/Download.vue')
const Favourites = () => import('../views/Favourites.vue')
const Layers = () => import('../views/Layers.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Layers',
    component: Layers,
  },
  {
    path: '/download',
    name: 'Download',
    component: Download,
  },
  {
    path: '/favourites',
    name: 'Favourites',
    component: Favourites,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
