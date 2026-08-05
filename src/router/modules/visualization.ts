const visualization: AuthRoute.Route = {
  name: 'visualization',
  path: '/visualization',
  component: 'self',
  meta: {
    title: '公司大屏',
    requiresAuth: true,
    keepAlive: true,
    singleLayout: 'big',
    permissions: ['super', 'admin', 'user'],
    icon: 'fluent:book-information-24-regular',
    order: 1
  }
};

export default visualization;
