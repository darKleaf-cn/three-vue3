import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';

const files = require.context('./files', true, /\.ts$/)
let constantModules: Array<RouteRecordRaw> = []
files.keys().forEach((key) => {
  constantModules = constantModules.concat(files(key).default)
})

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
        component: () => import('../Home.vue')
      }
    ]
  },
	...constantModules
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
