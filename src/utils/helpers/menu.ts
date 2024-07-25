import type { MenuOption } from 'naive-ui';
import { getTopLevelMenu } from '@/router';
import { useRouteStore } from '@/store';
import { useRouterPush } from './router';

export function useMenu() {
  const route = useRoute();
  const routeStore = useRouteStore();
  const { routerPush } = useRouterPush();

  // 默认设置上子菜单
  const defaultTopLevelMenu = getTopLevelMenu(route.name, routeStore.menus);
  routeStore.setChildrenMenus(defaultTopLevelMenu.children);

  const activeKey = computed(() => (route.meta?.activeMenu ? route.meta.activeMenu : route.name));
  const activeRootKey = computed(() => {
    const topLevelMenu = getTopLevelMenu(route.name, routeStore.menus);
    return topLevelMenu?.routeName;
  });

  /**
   * 更新选中根路由菜单
   */
  function handleUpdateRootMenu(key: AuthRoute.Route['name'], item: MenuOption) {
    const menuItem = (routeStore.menus as MenuOption[]).find(menu => menu.routeName === key);
    if (menuItem) {
      if (!(menuItem.children && menuItem.children.length)) {
        routerPush(menuItem.routePath as string);
      }
      routeStore.setChildrenMenus(menuItem.children);
    } else {
      routerPush(item.routePath as string);
    }
  }

  /**
   * 更新选中路由菜单
   */
  function handleUpdateMenu(_key: string, item: MenuOption) {
    const menuItem = item;
    routerPush(menuItem.routePath as string);
  }
  return {
    activeKey,
    activeRootKey,
    handleUpdateMenu,
    handleUpdateRootMenu
  };
}
