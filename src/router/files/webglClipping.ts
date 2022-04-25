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
      }
    ]
  }
] as Array<RouteRecordRaw>;
