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
const MisControlsPointerLock = () => import('../views/misc/controls/pointerLock/Index.vue');
const MisControlsTrackball = () => import('../views/misc/controls/trackball/Index.vue');
const MisControlsTransform = () => import('../views/misc/controls/transform/Index.vue');

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
    path: '/misc/animation',
    component: Layout,
    name: 'misc/animation',
    children: [
      {
        path: 'groups',
        name: 'groups',
        component: MiscAnimationGroups
      },
      {
        path: 'keys',
        name: 'keys',
        component: MiscAnimationKeys
      }
		]
	},
	{
    path: '/misc/boxselection',
    component: Layout,
    name: 'misc/boxselection',
		meta: {
      isSingle: true
    },
    children: [
      {
        path: '',
        component: MiscBoxselection
      }
		]
	},
	{
    path: '/misc/controls',
    component: Layout,
    name: 'misc/controls',
    children: [
      {
        path: 'arcball',
        name: 'arcball',
        component: MiscControlsArcball
      },
      {
        path: 'drag',
        name: 'drag',
        component: MiscControlsDrag
      },
      {
        path: 'map',
        name: 'map',
        component: MisControlsMap
      },
      {
        path: 'orbit',
        name: 'orbit',
        component: MisControlsOrbit
      },
      {
        path: 'pointerLock',
        name: 'pointerLock',
        component: MisControlsPointerLock
      },
      {
        path: 'trackball',
        name: 'trackball',
        component: MisControlsTrackball
      },
      {
        path: 'transfrom',
        name: 'transfrom',
				component: MisControlsTransform
      }
		]
	}
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
