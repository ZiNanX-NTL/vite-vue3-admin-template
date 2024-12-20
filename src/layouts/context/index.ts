import type { MenuOption } from 'naive-ui';
import { useRouteStore } from '@/store';
import { useContext } from '@/hooks';
import { useRouterPush } from '@/utils';

export const { setupStore: setupMixMenuContext, useStore: useMixMenuContext } = useContext('mix-menu', useMixMenu);

function useMixMenu() {
	const route = useRoute();
	const routeStore = useRouteStore();
	const { activeKey } = useMenu();

	const activeFirstLevelMenuKey = ref('');

	function setActiveFirstLevelMenuKey(key: string) {
		activeFirstLevelMenuKey.value = key;
	}

	function getActiveFirstLevelMenuKey() {
		const [firstLevelRouteName] = activeKey.value.split('_');

		setActiveFirstLevelMenuKey(firstLevelRouteName);
	}

	const allMenus = computed<App.GlobalMenuOption[]>(() => routeStore.menus);

	const firstLevelMenus = computed<App.GlobalMenuOption[]>(() =>
		routeStore.menus.map(menu => {
			const { children: _, ...rest } = menu;

			return rest;
		})
	);

	const childLevelMenus = computed<App.GlobalMenuOption[]>(
		() => routeStore.menus.find(menu => menu.key === activeFirstLevelMenuKey.value)?.children || []
	);

	const isActiveFirstLevelMenuHasChildren = computed(() => {
		if (!activeFirstLevelMenuKey.value) {
			return false;
		}

		const findItem = allMenus.value.find(item => item.key === activeFirstLevelMenuKey.value);

		return Boolean(findItem?.children?.length);
	});

	watch(
		() => route.name,
		() => {
			getActiveFirstLevelMenuKey();
		},
		{ immediate: true }
	);

	return {
		allMenus,
		firstLevelMenus,
		childLevelMenus,
		isActiveFirstLevelMenuHasChildren,
		activeFirstLevelMenuKey,
		setActiveFirstLevelMenuKey,
		getActiveFirstLevelMenuKey
	};
}

export function useMenu() {
	const route = useRoute();
	const { routerPush } = useRouterPush();

	const activeKey = computed(() => {
		const { activeMenu } = route.meta as unknown as AuthRoute.RouteMeta;
		const name = route.name as string;

		const routeName = activeMenu || name;

		return routeName;
	});

	/** 更新选中路由菜单 */
	function handleUpdateMenu(_key: string, item: MenuOption) {
		const menuItem = item;
		routerPush(menuItem.routePath as string);
	}

	return {
		activeKey,
		handleUpdateMenu
	};
}
