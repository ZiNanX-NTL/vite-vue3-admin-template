const tableRoute = {
  name: 'test-table',
  path: '/test-table',
  component: 'self',
  meta: {
    title: '表格页面',
    requiresAuth: true,
    keepAlive: false,
    singleLayout: 'basic',
    permissions: ['super', 'admin', 'user'],
    icon: 'fluent:book-information-24-regular',
    order: 4
  }
};

export default tableRoute;
