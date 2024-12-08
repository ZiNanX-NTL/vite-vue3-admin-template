import { useRouteStore } from '@/store';
import { useIconRender } from '@/utils';

/**
 * 将权限路由转换成菜单
 * @param routes - 路由
 */
export function transformAuthRouteToMenu(routes: AuthRoute.Route[]): App.GlobalMenuOption[] {
  const routeStore = useRouteStore();
  const globalMenu: App.GlobalMenuOption[] = [];
  routes.forEach(route => {
    const { name, path, meta } = route;
    const routeName = name;
    let menuChildren: App.GlobalMenuOption[] | undefined;
    if (route.children && route.children.length > 0) {
      menuChildren = transformAuthRouteToMenu(route.children);
    }
    const hideOfSimple = routeStore.isSimpleMode && meta.hideOfSimple;
    const menuItem = addPartialProps({
      menu: {
        key: routeName,
        label: meta.title,
        routeName,
        routePath: path,
        show: !meta.hide && !hideOfSimple
        // i18nTitle: meta.i18nTitle
      },
      icon: meta.icon,
      localIcon: meta.localIcon,
      children: menuChildren
    });

    globalMenu.push(menuItem);
  });

  return globalMenu;
}

/**
 * 将权限路由转换成一级菜单
 * @param routes - 路由
 */
export function transformAuthRouteToRootMenu(routes: AuthRoute.Route[]) {
  const routeStore = useRouteStore();
  const globalMenu: App.GlobalMenuOption[] = [];
  routes.forEach(route => {
    const { name, path, meta } = route;
    const routeName = name;
    const hideOfSimple = routeStore.isSimpleMode && meta.hideOfSimple;
    const menuItem = addPartialProps({
      menu: {
        key: routeName,
        label: meta.title,
        routeName,
        routePath: path,
        show: !meta.hide && !hideOfSimple
        // i18nTitle: meta.i18nTitle,
      },
      icon: meta.icon,
      localIcon: meta.localIcon
    });

    globalMenu.push(menuItem);
  });

  return globalMenu;
}

/** 给菜单添加可选属性 */
function addPartialProps(config: {
  menu: App.GlobalMenuOption;
  icon?: string;
  localIcon?: string;
  children?: App.GlobalMenuOption[];
}) {
  const { iconRender } = useIconRender();

  const item = { ...config.menu };

  const { icon, localIcon, children } = config;

  if (localIcon) {
    Object.assign(item, { icon: iconRender({ localIcon }) });
  }

  if (icon) {
    Object.assign(item, { icon: iconRender({ icon }) });
  }

  if (children) {
    Object.assign(item, { children });
  }
  return item;
}

/**
 * 获取当前路由所在菜单数据的paths
 * @param activeKey - 当前路由的key
 * @param menus - 菜单数据
 */
export function getActiveKeyPathsOfMenus(activeKey: string, menus: App.GlobalMenuOption[]) {
  const keys = menus.map(menu => getActiveKeyPathsOfMenu(activeKey, menu)).flat(1);
  return keys;
}

function getActiveKeyPathsOfMenu(activeKey: string, menu: App.GlobalMenuOption): string[] {
  const keys = [];
  if (activeKey.startsWith(menu.routeName)) {
    keys.push(menu.routeName);
  }
  if (menu.children) {
    keys.push(...menu.children.map(item => getActiveKeyPathsOfMenu(activeKey, item as App.GlobalMenuOption)).flat(1));
  }
  return keys;
}
