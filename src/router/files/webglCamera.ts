import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';

export default [
  {
    path: '/webgl/camera',
    component: Layout,
    name: 'webgl/camera',
    children: [
      {
        path: 'index',
        name: 'index',
        component: () => import('@/views/webgl/camera/Index.vue')
      },
			{
        path: 'array',
        name: 'array',
        component: () => import('@/views/webgl/camera/Array.vue')
      },
			{
        path: 'cinematic',
        name: 'cinematic',
        component: () => import('@/views/webgl/camera/Cinematic.vue')
      },
			{
        path: 'buffer',
        name: 'buffer',
        component: () => import('@/views/webgl/camera/buffer.vue')
      }
    ]
  }
] as Array<RouteRecordRaw>;
