import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';

export default [
  {
    path: '/webgl/clipping',
    component: Layout,
    name: 'webgl/clipping',
    children: [
      {
        path: 'index',
        name: 'index',
        component: () => import('@/views/webgl/clipping/Index.vue')
      },
			{
        path: 'advanced',
        name: 'advanced',
        component: () => import('@/views/webgl/clipping/Advanced.vue')
      },
			{
        path: 'intersection',
        name: 'intersection',
        component: () => import('@/views/webgl/clipping/Intersection.vue')
      },
			{
        path: 'stencil',
        name: 'stencil',
        component: () => import('@/views/webgl/clipping/Stencil.vue')
      }
    ]
  }
] as Array<RouteRecordRaw>;
