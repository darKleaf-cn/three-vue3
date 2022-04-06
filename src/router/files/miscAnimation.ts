import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';

export default [
	{
    path: '/misc/animation',
    component: Layout,
    name: 'misc/animation',
    children: [
      {
        path: 'groups',
        name: 'groups',
        component: () => import('@/views/misc/aimation/groups/Index.vue')
      },
      {
        path: 'keys',
        name: 'keys',
        component: () => import('@/views/misc/aimation/keys/Index.vue')
      }
    ]
  }
] as Array<RouteRecordRaw>;