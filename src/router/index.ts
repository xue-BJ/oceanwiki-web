import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }, 
  {
    path: '/admin/ebook',
    name: 'AdminEbook',
    component: () => import('../views/admin-ebook.vue')
  }, 
  {
    path: '/admin/category',
    name: 'AdminCategory',
    component: () => import('../views/admin-category.vue')
  }, 
  {
    path: '/admin/doc',
    name: 'AdminDoc',
    component: () => import('../views/admin-doc.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
