import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';

export default [
	{
    path: '/misc/exporter',
    component: Layout,
    name: 'misc/exporter',
    children: [
      {
        path: 'collada',
        name: 'collada',
        component: () => import('@/views/misc/exporter/collada/Index.vue')
      }
    ]
  }
] as Array<RouteRecordRaw>;