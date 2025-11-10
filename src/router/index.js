import { createRouter, createWebHashHistory } from 'vue-router'
import AccountList from '../views/AccountList.vue'
import GraphView from '../views/GraphView.vue'
import RulesList from '../views/RulesList.vue'
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
    path: '/rules',
    name: 'RulesList',
    component: RulesList
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
