import Vue from 'vue'
import VueRouter from 'vue-router'

const Download = () => import('../views/Download.vue')
const Favourites = () => import('../views/Favourites.vue')
const Home = () => import('../views/Home.vue')
const Layers = () => import('../views/Layers.vue')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
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
  {
    path: '/layers',
    name: 'Layers',
    component: Layers,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
