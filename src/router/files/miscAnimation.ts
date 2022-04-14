import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';
import Official from '@/views/Official.vue';

export default [
	{
    path: '/misc/animation',
    component: Layout,
    name: 'misc/animation',
    children: [
      {
        path: 'groups',
        name: 'groups',
        component: Official
      },
      {
        path: 'keys',
        name: 'keys',
        component: Official
      }
    ]
  }
] as Array<RouteRecordRaw>;