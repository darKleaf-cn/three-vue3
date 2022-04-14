import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';
import Official from '@/views/Official.vue';

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
        component: Official
      }
    ]
  }
] as Array<RouteRecordRaw>;