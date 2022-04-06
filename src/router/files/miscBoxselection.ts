import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';

export default [
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
        component: () => import('@/views/misc/boxselection/Index.vue')
      }
    ]
  }
] as Array<RouteRecordRaw>;