import { createRouter, createWebHashHistory } from 'vue-router'
import AccountList from '../views/AccountList.vue'
import GraphView from '../views/GraphView.vue'
import AccountDetail from '../views/AccountDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/graph'
  },
  {
    path: '/graph',
    name: 'GraphView',
    component: GraphView
  },
  {
    path: '/account_list',
    name: 'AccountList',
    component: AccountList
  },
  {
    path: '/account/:id',
    name: 'AccountDetail',
    component: AccountDetail,
    props: true
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
