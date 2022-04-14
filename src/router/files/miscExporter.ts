import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';
import Official from '@/views/Official.vue';

export default [
	{
    path: '/misc/exporter',
    component: Layout,
    name: 'misc/exporter',
    children: [
      {
        path: 'collada',
        name: 'collada',
        component: Official
      }
    ]
  }
] as Array<RouteRecordRaw>;