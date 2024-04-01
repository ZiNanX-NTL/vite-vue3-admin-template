const functionRoute: AuthRoute.Route = {
  name: 'function',
  path: '/function',
  component: 'basic',
  children: [
    {
      name: 'function_tab',
      path: '/function/tab',
      component: 'self',
      meta: {
        title: 'Tab',
        requiresAuth: false,
        icon: 'ic:round-tab'
      }
    },
    {
      name: 'function_tab-detail',
      path: '/function/tab-detail',
      component: 'self',
      meta: {
        title: 'Tab Detail',
        requiresAuth: true,
        hide: true,
        activeMenu: 'function_tab',
        icon: 'ic:round-tab'
      }
    },
    {
      name: 'function_tab-multi-detail',
      path: '/function/tab-multi-detail',
      component: 'self',
      meta: {
        title: 'Tab Multi Detail',
        requiresAuth: true,
        hide: true,
        multiTab: true,
        activeMenu: 'function_tab',
        icon: 'ic:round-tab'
      }
    },
    {
      name: 'function_toggle-auth',
      path: '/function/toggle-auth',
      component: 'self',
      meta: {
        title: '权限切换',
        icon: 'ic:round-tab'
      }
    },
    {
      name: 'function_test-page',
      path: '/function/test-page',
      component: 'self',
      meta: {
        title: '权限测试页面',
        icon: 'ic:round-tab',
        permissions: ['super']
      }
    }
  ],
  meta: {
    title: '系统功能',
    icon: 'fluent:book-information-24-regular',
    order: 2
  }
};

export default functionRoute;
