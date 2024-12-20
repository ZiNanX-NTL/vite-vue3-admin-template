export const routeModel = {
	super: [
		{
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
		},
		{
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
		},
		{
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
		},
		{
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
		}
	],
	admin: [
		{
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
		},
		{
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
				}
			],
			meta: {
				title: '系统功能',
				icon: 'fluent:book-information-24-regular',
				order: 2
			}
		},
		{
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
		},
		{
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
		}
	],
	user: [
		{
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
		},
		{
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
				}
			],
			meta: {
				title: '系统功能',
				icon: 'fluent:book-information-24-regular',
				order: 2
			}
		},
		{
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
		}
	]
};
