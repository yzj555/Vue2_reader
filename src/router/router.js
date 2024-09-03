import Vue from 'vue'
import VueRouter from 'vue-router' // 导入router

import A from '../pages/A.vue'
import B from '../pages/B.vue'
import FirstPage from '../pages/FirstPage.vue'
import MainView from '../pages/MainView.vue'
import BookShelf from '../pages/BookShelf.vue'
import BookReader from '../pages/BookReader.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/A', component: A },
  { path: '/B', component: B },
  // { path: '/', component: MainView },
  {
    path: '/',
    component: MainView,
    name: 'mainView',
    children: [
      { path: '/', component: FirstPage },
      { path: '/firstPage', component: FirstPage, name: 'firstPage' },
      { path: '/bookShelf', component: BookShelf, name: 'bookShelf' },
    ]
  },
  {
    path: '/bookReader',
    component: BookReader,
    name: 'bookReader'
  }

]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router