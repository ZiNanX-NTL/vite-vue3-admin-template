import type { MenuOption } from 'naive-ui';
import { getTopLevelMenu } from '@/router';
import { useRouteStore, useThemeStore } from '@/store';
import { useRouterPush } from './router';

let initMenu = false;
export function useMenu() {
  const scope = effectScope();
  const routeStore = useRouteStore();
  const theme = useThemeStore();
  const { route, routerPush } = useRouterPush(false);

  const activeKey = computed(() => (route.value.meta?.activeMenu ? route.value.meta.activeMenu : route.value.name));
  const activeRootKey = computed(() => {
    const topLevelMenu = getTopLevelMenu(route.value.name as string, routeStore.menus);
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
      } else {
        // 设置默认选中子菜单
        routerPush(menuItem.children[0].routePath as string);
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

  /** 根据顶层菜单设置子菜单项 */
  function setChildrenMenusFromTopLevelMenu() {
    const defaultTopLevelMenu = getTopLevelMenu(route.value.name as string, routeStore.menus);
    routeStore.setChildrenMenus(defaultTopLevelMenu?.children);
  }

  if (!initMenu) {
    scope.run(() => {
      initMenu = true;
      watch(
        () => route.value.name,
        () => {
          if (theme.layout.isMenuSeparation) {
            // 默认设置上子菜单
            setChildrenMenusFromTopLevelMenu();
          }
        },
        {
          immediate: true
        }
      );

      watch(
        () => theme.layout.isMenuSeparation,
        val => {
          if (val) {
            // 默认设置上子菜单
            setChildrenMenusFromTopLevelMenu();
          } else {
            routeStore.setChildrenMenus();
          }
        }
      );
    });
  }
  return {
    activeKey,
    activeRootKey,
    handleUpdateMenu,
    handleUpdateRootMenu,
    setChildrenMenusFromTopLevelMenu
  };
}
