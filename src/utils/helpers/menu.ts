import type { MenuOption } from 'naive-ui';
import { getTopLevelMenu } from '@/router';
import { useRouteStore, useThemeStore } from '@/store';
import { useRouterPush } from './router';

export function useMenu() {
  const scope = effectScope();
  const route = useRoute();
  const routeStore = useRouteStore();
  const theme = useThemeStore();
  const { routerPush } = useRouterPush();

  const activeKey = computed(() => (route.meta?.activeMenu ? route.meta.activeMenu : route.name));
  const activeRootKey = computed(() => {
    const topLevelMenu = getTopLevelMenu(route.name as string, routeStore.menus);
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
      routeStore.setChildrenMenus(menuItem?.children as App.GlobalMenuOption[]);
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

  scope.run(() => {
    watch(
      () => route.name,
      () => {
        if (theme.layout.isMenuSeparation) {
          // 默认设置上子菜单
          const defaultTopLevelMenu = getTopLevelMenu(route.name as string, routeStore.menus);
          routeStore.setChildrenMenus(defaultTopLevelMenu?.children);
        }
      },
      { immediate: true }
    );

    watch(
      () => theme.layout.isMenuSeparation,
      val => {
        if (val) {
          // 默认设置上子菜单
          const defaultTopLevelMenu = getTopLevelMenu(route.name as string, routeStore.menus);
          routeStore.setChildrenMenus(defaultTopLevelMenu?.children);
        } else {
          routeStore.setChildrenMenus();
        }
      }
    );
  });
  return {
    activeKey,
    activeRootKey,
    handleUpdateMenu,
    handleUpdateRootMenu
  };
}
