const testPageRoute: AuthRoute.Route = {
  name: 'test-page',
  path: '/test-page',
  component: 'self',
  meta: {
    title: '测试页面',
    requiresAuth: true,
    keepAlive: true,
    singleLayout: 'basic',
    permissions: ['super', 'admin', 'user'],
    icon: 'fluent:book-information-24-regular',
    order: 3
  }
};

export default testPageRoute;
