import { RouteRecordRaw } from 'vue-router';
import Layout from '@/components/layout/Index.vue';
import Official from '@/views/Official.vue';

export default [
	{
    path: '/webgl/animation',
    component: Layout,
    name: 'webgl/animation',
    children: [
      {
        path: 'keyframes',
        name: 'keyframes',
        component: Official
      },
			{
        path: 'multiple',
        name: 'multiple',
        component: Official
      }
    ]
  }
] as Array<RouteRecordRaw>;