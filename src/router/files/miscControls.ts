import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';

export default [
	{
    path: '/misc/controls',
    component: Layout,
    name: 'misc/controls',
    children: [
      {
        path: 'arcball',
        name: 'arcball',
        component: () => import('@/views/misc/controls/arcball/Index.vue')
      },
      {
        path: 'drag',
        name: 'drag',
        component: () => import('@/views/misc/controls/drag/Index.vue')
      },
      {
        path: 'map',
        name: 'map',
        component: () => import('@/views/misc/controls/map/Index.vue')
      },
      {
        path: 'orbit',
        name: 'orbit',
        component: () => import('@/views/misc/controls/orbit/Index.vue')
      },
      {
        path: 'pointerLock',
        name: 'pointerLock',
        component: () => import('@/views/misc/controls/pointerLock/Index.vue')
      },
      {
        path: 'trackball',
        name: 'trackball',
        component: () => import('@/views/misc/controls/trackball/Index.vue')
      },
      {
        path: 'transfrom',
        name: 'transfrom',
        component: () => import('@/views/misc/controls/transform/Index.vue')
      }
    ]
  }
] as Array<RouteRecordRaw>;