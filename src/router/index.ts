import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

import Layout from '@/components/layout/Index.vue';
const Home = () => import('../views/Home.vue');
const MiscAnimationGroups = () => import('../views/official/miscAnimationGroups/Index.vue');
const MiscAnimationKeys = () => import('../views/official/miscAnimationKeys/Index.vue');
const MiscBoxselection = () => import('../views/official/miscBoxselection/Index.vue');
const MiscControlsArcball = () => import('../views/official/miscControlsArcball/Index.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home',
    meta: {
      hidden: true
    }
  },
  {
    path: '/home',
    component: Layout,
    name: 'home',
    meta: {
      isSingle: true
    },
    children: [
      {
        path: '',
        component: Home
      }
    ]
  },
  {
    path: '/official',
    component: Layout,
    name: '官方实例',
    children: [
      {
        path: 'miscAnimationGroups',
        name: 'miscAnimationGroups',
        component: MiscAnimationGroups
      },
      {
        path: 'miscAnimationKeys',
        name: 'miscAnimationKeys',
        component: MiscAnimationKeys
      },
      {
        path: 'miscBoxselection',
        name: 'miscBoxselection',
        component: MiscBoxselection
      },
      {
        path: 'miscControlsArcball',
        name: 'miscControlsArcball',
        component: MiscControlsArcball
      }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
