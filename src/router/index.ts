import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import ReportPage from '@/pages/ReportPage.vue'
import TrackPage from '@/pages/TrackPage.vue'
import MyOrdersPage from '@/pages/MyOrdersPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/report',
    name: 'report',
    component: ReportPage,
  },
  {
    path: '/track/:orderId',
    name: 'track',
    component: TrackPage,
  },
  {
    path: '/my-orders',
    name: 'my-orders',
    component: MyOrdersPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
