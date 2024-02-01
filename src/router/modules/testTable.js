const tableRoute = {
  name: 'test-table',
  path: '/test-table',
  component: 'basic',
  children: [
    {
      name: 'test-table_table',
      path: '/test-table/table',
      component: 'self',
      meta: {
        title: '表格页面1',
        requiresAuth: true,
        keepAlive: false,
        singleLayout: 'self',
        permissions: ['super', 'admin', 'user'],
        icon: 'ic:round-tab'
      }
    },
    {
      name: 'test-table_search-table',
      path: '/test-table/search-table',
      component: 'self',
      meta: {
        title: '表格页面2',
        requiresAuth: true,
        keepAlive: false,
        singleLayout: 'self',
        permissions: ['super', 'admin', 'user'],
        icon: 'ic:round-tab'
      }
    }
  ],
  meta: {
    title: '表格页面',
    permissions: ['super', 'admin', 'user'],
    icon: 'fluent:book-information-24-regular',
    order: 4
  }
};

export default tableRoute;
