import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';

export default [
  {
    path: '/webgl/decals',
    component: Layout,
    name: 'webgl/decals',
    children: [
      {
        path: 'index',
        name: 'index',
        component: () => import('@/views/webgl/decals/Index.vue')
      }
    ]
  }
] as Array<RouteRecordRaw>;
