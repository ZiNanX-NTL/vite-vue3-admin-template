const pageRoute: AuthRoute.Route = {
  name: 'test-page',
  path: '/test-page',
  component: 'basic',
  children: [
    {
      name: 'test-page_function-test',
      path: '/test-page/function-test',
      component: 'self',
      meta: {
        title: '测试',
        requiresAuth: true,
        keepAlive: false,
        permissions: ['super', 'admin', 'user'],
        icon: 'ic:round-tab'
      }
    },
    {
      name: 'test-page_seat',
      path: '/test-page/seat',
      component: 'self',
      meta: {
        title: '选座',
        requiresAuth: true,
        keepAlive: false,
        permissions: ['super', 'admin', 'user'],
        icon: 'ic:round-tab'
      }
    }
  ],
  meta: {
    title: '功能页面',
    permissions: ['super', 'admin', 'user'],
    icon: 'fluent:book-information-24-regular',
    order: 3
  }
};

export default pageRoute;
