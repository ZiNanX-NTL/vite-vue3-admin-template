const plantOverview: AuthRoute.Route = {
  name: 'plant-overview',
  path: '/plant-overview',
  component: 'self',
  meta: {
    title: '种植概况',
    requiresAuth: true,
    keepAlive: true,
    singleLayout: 'basic',
    permissions: ['super', 'admin', 'user'],
    icon: 'fluent:book-information-24-regular',
    order: 1
  }
};

export default plantOverview;
