import { useIconRender } from '@/utils';

/**
 * 将权限路由转换成菜单
 * @param routes - 路由
 */
export function transformAuthRouteToMenu(routes) {
  const globalMenu = [];
  routes.forEach(route => {
    const { name, path, meta } = route;
    const routeName = name;
    let menuChildren;
    if (route.children && route.children.length > 0) {
      menuChildren = transformAuthRouteToMenu(route.children);
    }
    const menuItem = addPartialProps({
      menu: {
        key: routeName,
        label: meta.title,
        routeName,
        routePath: path,
        i18nTitle: meta.i18nTitle
      },
      icon: meta.icon,
      localIcon: meta.localIcon,
      children: menuChildren
    });

    if (!hideInMenu(route)) {
      globalMenu.push(menuItem);
    }
  });

  return globalMenu;
}

/**
 * 将权限路由转换成一级菜单
 * @param routes - 路由
 */
export function transformAuthRouteToRootMenu(routes, isRoot = true) {
  const globalMenu = [];
  routes.forEach(route => {
    const { name, path, meta } = route;
    const routeName = name;
    // let menuChildren;
    // if (route.children && route.children.length > 0) {
    //   menuChildren = transformAuthRouteToRootMenu(route.children, false);
    // }
    const menuItem = addPartialProps({
      menu: {
        key: routeName,
        label: meta.title,
        routeName,
        routePath: path,
        i18nTitle: meta.i18nTitle,
        show: isRoot
      },
      icon: meta.icon,
      localIcon: meta.localIcon
      // children: menuChildren
    });

    if (!hideInMenu(route)) {
      globalMenu.push(menuItem);
    }
  });

  return globalMenu;
}

/** 路由不转换菜单 */
function hideInMenu(route) {
  return Boolean(route.meta.hide);
}

/** 给菜单添加可选属性 */
function addPartialProps(config) {
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
export function getActiveKeyPathsOfMenus(activeKey, menus) {
  const keys = menus.map(menu => getActiveKeyPathsOfMenu(activeKey, menu)).flat(1);
  return keys;
}

function getActiveKeyPathsOfMenu(activeKey, menu) {
  const keys = [];
  if (activeKey.startsWith(menu.routeName)) {
    keys.push(menu.routeName);
  }
  if (menu.children) {
    keys.push(...menu.children.map(item => getActiveKeyPathsOfMenu(activeKey, item)).flat(1));
  }
  return keys;
}
