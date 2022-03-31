import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

import Layout from '@/components/layout/Index.vue';
const Home = () => import('../views/Home.vue');
const MiscAnimationGroups = () => import('../views/misc/aimation/groups/Index.vue');
const MiscAnimationKeys = () => import('../views/misc/aimation/keys/Index.vue');
const MiscBoxselection = () => import('../views/misc/boxselection/Index.vue');
const MiscControlsArcball = () => import('../views/misc/controls/arcball/Index.vue');
const MiscControlsDrag = () => import('../views/misc/controls/drag/Index.vue');
const MisControlsMap = () => import('../views/misc/controls/map/Index.vue');
const MisControlsOrbit = () => import('../views/misc/controls/orbit/Index.vue');

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
    path: '/misc',
    component: Layout,
    name: 'misc',
    children: [
      {
        path: 'animation/groups',
        name: 'animation/groups',
        component: MiscAnimationGroups
      },
      {
        path: 'animation/keys',
        name: 'animation/keys',
        component: MiscAnimationKeys
      },
      {
        path: 'boxselection',
        name: 'boxselection',
        component: MiscBoxselection
      },
      {
        path: 'controls/arcball',
        name: 'controls/arcball',
        component: MiscControlsArcball
      },
      {
        path: 'controls/drag',
        name: 'controls/drag',
        component: MiscControlsDrag
      },
      {
        path: 'controls/map',
        name: 'controls/map',
        component: MisControlsMap
      },
			{
        path: 'controls/orbit',
        name: 'controls/orbit',
        component: MisControlsOrbit
      }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
