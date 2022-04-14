import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';
import Official from '@/views/Official.vue';

export default [
  {
    path: '/misc/controls',
    component: Layout,
    name: 'misc/controls',
    children: [
      {
        path: 'arcball',
        name: 'arcball',
        component: Official
      },
      {
        path: 'drag',
        name: 'drag',
        component: Official
      },
      {
        path: 'map',
        name: 'map',
        component: Official
      },
      {
        path: 'orbit',
        name: 'orbit',
        component: Official
      },
      {
        path: 'pointerLock',
        name: 'pointerLock',
        component: Official
      },
      {
        path: 'trackball',
        name: 'trackball',
        component: Official
      },
      {
        path: 'transform',
        name: 'transform',
        component: Official
      }
    ]
  }
] as Array<RouteRecordRaw>;
