import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';

export default [
	{
    path: '/webgl/animation',
    component: Layout,
    name: 'webgl/animation',
    children: [
      {
        path: 'keyframes',
        name: 'keyframes',
        component: () => import('@/views/webgl/animation/keyframes/Index.vue')
      }
    ]
  }
] as Array<RouteRecordRaw>;