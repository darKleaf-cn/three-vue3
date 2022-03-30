import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

import Layout from '@/components/layout/Index.vue';
const Home = () => import('../views/Home.vue');
const MiscAnimationGroups = () => import('../views/official/miscAnimationGroups/MiscAnimationGroups.vue');
const MiscAnimationKeys = () => import('../views/official/miscAnimationKeys/MiscAnimationKeys.vue');
const MiscBoxselection = () => import('../views/official/miscBoxselection/MiscBoxselection.vue');
const MiscControlsArcball = () => import('../views/official/miscControlsArcball/MiscControlsArcball.vue');
const MiscControlsDrag = () => import('../views/official/miscControlsDrag/MiscControlsDrag.vue')

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
      },
			{
        path: 'miscControlsDrag',
        name: 'miscControlsDrag',
        component: MiscControlsDrag
      }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
