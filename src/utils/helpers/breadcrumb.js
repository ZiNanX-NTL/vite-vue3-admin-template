import { getTopLevelMenu } from '@/router';
/**
 * 获取面包屑数据
 * @param activeKey - 当前页面路由的key
 * @param menus - 菜单数据
 * @param rootPath - 根路由路径
 */
export function getBreadcrumbByRouteKey(activeKey, menus, rootPath) {
  const breadcrumbMenu = getBreadcrumbMenu(activeKey, menus);
  const breadcrumb = breadcrumbMenu.map(item => transformBreadcrumbMenuToBreadcrumb(item, rootPath));
  return breadcrumb;
}

/**
 * 根据菜单数据获取面包屑格式的菜单
 * @param activeKey - 当前页面路由的key
 * @param menus - 菜单数据
 */
function getBreadcrumbMenu(activeKey, menus) {
  const breadcrumbMenu = [];
  const topLevelMenu = getTopLevelMenu(activeKey, menus);
  const options = topLevelMenu ? getBreadcrumbMenuItem(activeKey, topLevelMenu) : [];
  breadcrumbMenu.push(...options);
  return breadcrumbMenu;
}

/**
 * 根据单个菜单数据获取面包屑格式的菜单
 * @param activeKey - 当前页面路由的key
 * @param menu - 单个菜单数据
 */
function getBreadcrumbMenuItem(activeKey, menu) {
  const breadcrumbMenu = [];
  if (activeKey === menu.routeName) {
    breadcrumbMenu.push(menu);
  }
  if (activeKey.includes(menu.routeName) && menu.children && menu.children.length) {
    breadcrumbMenu.push(menu);
    breadcrumbMenu.push(...menu.children.map(item => getBreadcrumbMenuItem(activeKey, item)).flat(1));
  }

  return breadcrumbMenu;
}

/**
 * 将面包屑格式的菜单数据转换成面包屑数据
 * @param menu - 单个菜单数据
 * @param rootPath - 根路由路径
 */
function transformBreadcrumbMenuToBreadcrumb(menu, rootPath) {
  const hasChildren = Boolean(menu.children && menu.children.length);
  const breadcrumb = {
    key: menu.routeName,
    label: menu.label,
    routeName: menu.routeName,
    disabled: menu.routePath === rootPath,
    hasChildren,
    i18nTitle: menu.i18nTitle
  };
  if (menu.icon) {
    breadcrumb.icon = menu.icon;
  }
  if (hasChildren) {
    breadcrumb.options = menu.children?.map(item => transformBreadcrumbMenuToBreadcrumb(item, rootPath));
  }
  return breadcrumb;
}
