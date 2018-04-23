import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index'
import Card from '@/components/Card'
import Borrow from '@/components/Borrow'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/card',
      name: 'Card',
      component: Card
    },
    {
      path: '/borrow',
      name: 'Borrow',
      component: Borrow
    }
  ]
})
