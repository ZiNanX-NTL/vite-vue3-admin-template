import { getLoginModuleRegExp } from '../helpers';

/** 根路由: / */
export const ROOT_ROUTE = {
  name: 'root',
  path: '/',
  redirect: import.meta.env.VITE_ROUTE_HOME_PATH,
  meta: {
    title: 'Root'
  }
};

/** 固定的路由 */
export const constantRoutes = [
  ROOT_ROUTE,
  {
    name: 'login',
    path: '/login',
    component: 'self',
    props: route => {
      const moduleType = route.params.module || 'pwd-login';
      return {
        module: moduleType
      };
    },
    meta: {
      title: '登录',
      dynamicPath: `/login/:module(${getLoginModuleRegExp()})?`,
      singleLayout: 'blank'
    }
  },
  {
    name: '403',
    path: '/403',
    component: 'self',
    meta: {
      title: '无权限',
      singleLayout: 'blank'
    }
  },
  {
    name: '404',
    path: '/404',
    component: 'self',
    meta: {
      title: '未找到',
      singleLayout: 'blank'
    }
  },
  {
    name: '500',
    path: '/500',
    component: 'self',
    meta: {
      title: '服务器错误',
      singleLayout: 'blank'
    }
  },
  // 匹配无效路径的路由
  {
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    component: 'blank',
    meta: {
      title: '未找到',
      singleLayout: 'blank'
    }
  }
  // {
  //   name: 'layout',
  //   path: '/layout',
  //   component: BlankLayout,
  //   meta: {
  //     title: '布局页'
  //   },
  //   children: [
  //     {
  //       name: 'plant_overview',
  //       path: 'plant-overview',
  //       component: () => import('@/views/plant-overview/index.vue'),
  //       meta: {
  //         title: '种植概况'
  //       }
  //     }
  //   ]
  // }
];
