const tableRoute: AuthRoute.Route = {
  name: 'test-table',
  path: '/test-table',
  component: 'basic',
  children: [
    {
      name: 'test-table_table',
      path: '/test-table/table',
      component: 'self',
      meta: {
        title: '基础表格',
        requiresAuth: true,
        keepAlive: false,
        permissions: ['super', 'admin', 'user'],
        icon: 'ic:round-tab'
      }
    },
    {
      name: 'test-table_search-table',
      path: '/test-table/search-table',
      component: 'self',
      meta: {
        title: '搜索表格',
        requiresAuth: true,
        keepAlive: false,
        permissions: ['super', 'admin', 'user'],
        icon: 'ic:round-tab'
      }
    },
    {
      name: 'test-table_high-level-Search',
      path: '/test-table/high-level-Search',
      component: 'self',
      meta: {
        title: '高级检索',
        requiresAuth: true,
        keepAlive: false,
        permissions: ['super', 'admin', 'user'],
        icon: 'ic:round-tab'
      }
    }
  ],
  meta: {
    title: '表格示例',
    permissions: ['super', 'admin', 'user'],
    icon: 'fluent:book-information-24-regular',
    order: 4
  }
};

export default tableRoute;
