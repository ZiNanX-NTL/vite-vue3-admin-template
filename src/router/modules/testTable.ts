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
			name: 'test-table_local-table',
			path: '/test-table/local-table',
			component: 'self',
			meta: {
				title: '本地分页',
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
			name: 'test-table_high-level-search',
			path: '/test-table/high-level-search',
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
