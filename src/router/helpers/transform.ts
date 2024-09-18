import type { RouteRecordRaw, RouteComponent } from 'vue-router';
import { isString } from '@/utils';
import { getLayout, getViewComponent, setViewComponentName } from './component';

const { layoutTypes, getLayoutComponent } = getLayout();

/**
 * 将权限路由转换成vue路由
 * @param routes - 权限路由
 * @description 所有多级路由都会被转换成二级路由
 */
export function transformAuthRouteToVueRoutes(routes: AuthRoute.Route[]) {
  return routes.map(route => transformAuthRouteToVueRoute(route)).flat(1);
}

type Lazy<T> = () => Promise<T>;
interface ModuleComponent {
  default: RouteComponent;
}

/**
 * 将单个权限路由转换成vue路由
 * @param item - 单个权限路由
 */
export function transformAuthRouteToVueRoute(item: AuthRoute.Route) {
  const resultRoute: RouteRecordRaw[] = [];

  const itemRoute = { ...item } as unknown as RouteRecordRaw;

  // 动态path
  if (hasDynamicPath(item)) {
    Object.assign(itemRoute, { path: item.meta.dynamicPath });
  }

  // 外链路由
  if (hasHref(item)) {
    Object.assign(itemRoute, { component: getViewComponent('404') });
  }

  // 路由组件
  if (hasComponent(item)) {
    if (isAutoComponent(item)) {
      const action: any = {
        multi() {
          // 多级路由一定有子路由
          if (hasChildren(item)) {
            Object.assign(itemRoute, { meta: { ...itemRoute.meta, multi: true } });
            delete itemRoute.component;
          } else {
            window.console.error('多级路由缺少子路由: ', item);
          }
        },
        self() {
          itemRoute.component = getViewComponent(item.name);
        }
      };
      layoutTypes.forEach(type => {
        action[type] = () => (itemRoute.component = getLayoutComponent(type));
      });
      try {
        if (item.component) {
          action[item.component]();
        } else {
          window.console.error('路由组件解析失败: ', item);
        }
      } catch {
        window.console.error('路由组件解析失败: ', item);
      }
    } else {
      itemRoute.component = setViewComponentName(itemRoute.component as Lazy<ModuleComponent>, item.name);
    }
  }

  // 注意：单独路由没有children
  if (isSingleRoute(item)) {
    if (hasChildren(item)) {
      window.console.error('单独路由不应该有子路由: ', item);
    }

    // 捕获无效路由的需特殊处理
    if (item.name === 'not-found') {
      delete itemRoute.name;
      itemRoute.children = [
        {
          path: '',
          name: item.name,
          component: getViewComponent('not-found')
        }
      ];
    } else {
      const parentPath = itemRoute.path;

      const layout =
        item.meta.singleLayout && layoutTypes.includes(item.meta.singleLayout)
          ? getLayoutComponent(item.meta.singleLayout)
          : getLayoutComponent('blank');

      const parentRoute: RouteRecordRaw = {
        path: parentPath,
        component: layout,
        children: [{ ...itemRoute, path: '' }]
      };

      return [parentRoute];
    }
  }

  // 子路由
  if (hasChildren(item)) {
    const children = (item.children as AuthRoute.Route[]).map(child => transformAuthRouteToVueRoute(child)).flat();

    // 找出第一个不为多级路由中间级的子路由路径作为重定向路径
    const redirectPath = children.find(v => !v.meta?.multi)?.path || '/';

    if (redirectPath === '/') {
      window.console.error('该多级路由没有有效的子路径', item);
    }

    if (item.component === 'multi') {
      // 多级路由，将子路由提取出来变成同级
      resultRoute.push(...children);
      delete itemRoute.children;
    } else {
      itemRoute.children = children;
    }
    itemRoute.redirect = redirectPath;
  }

  resultRoute.push(itemRoute);

  return resultRoute;
}

/**
 * 将权限路由转换成搜索的菜单数据
 * @param routes - 权限路由
 * @param treeMap
 */
export function transformAuthRouteToSearchMenus(routes: AuthRoute.Route[], treeMap: AuthRoute.Route[] = []) {
  if (routes && routes.length === 0) return [];
  return routes.reduce((acc, cur) => {
    if (!cur.meta?.hide) {
      acc.push(cur);
    }
    if (cur.children && cur.children.length > 0) {
      transformAuthRouteToSearchMenus(cur.children, treeMap);
    }
    return acc;
  }, treeMap);
}

/** 将路由名字转换成路由路径 */
export function transformRouteNameToRoutePath(name: string) {
  const rootPath = '/';
  if (name === 'root') return rootPath;

  const splitMark = '_';
  const pathSplitMark = '/';
  const path = name.split(splitMark).join(pathSplitMark);

  return pathSplitMark + path;
}

/** 将路由路径转换成路由名字 */
export function transformRoutePathToRouteName(path: string) {
  if (path === '/') return 'root';

  const pathSplitMark = '/';
  const routeSplitMark = '_';

  const name = path.split(pathSplitMark).slice(1).join(routeSplitMark);

  return name;
}

/**
 * 是否有外链
 * @param item - 权限路由
 */
function hasHref(item: AuthRoute.Route) {
  return Boolean(item.meta.href);
}

/**
 * 是否有动态路由path
 * @param item - 权限路由
 */
function hasDynamicPath(item: AuthRoute.Route) {
  return Boolean(item.meta.dynamicPath);
}

/**
 * 是否有路由组件
 * @param item - 权限路由
 */
function hasComponent(item: AuthRoute.Route) {
  return Boolean(item.component);
}

/**
 * 是否是自动加载路由组件
 * @param item - 权限路由
 */
function isAutoComponent(item: AuthRoute.Route) {
  return isString(item.component);
}

/**
 * 是否有子路由
 * @param item - 权限路由
 */
function hasChildren(item: AuthRoute.Route) {
  return Boolean(item.children && item.children.length);
}

/**
 * 是否是单层级路由
 * @param item - 权限路由
 */
function isSingleRoute(item: AuthRoute.Route) {
  return Boolean(item.meta.singleLayout);
}

/**
 * 获取所有固定路由的名称集合
 * @param routes - 固定路由
 */
export function getConstantRouteNames(routes: AuthRoute.Route[]) {
  return routes.map(route => getConstantRouteName(route)).flat(1);
}

/**
 * 获取所有固定路由的名称集合
 * @param route - 固定路由
 */
function getConstantRouteName(route: AuthRoute.Route) {
  const names = [route.name];
  if (route.children?.length) {
    names.push(...route.children.map(item => getConstantRouteName(item)).flat(1));
  }
  return names;
}

/**
 * 根据路由名称查找顶级菜单
 * @param routeName - 当前页面路由的key
 * @param menus - 菜单数据
 */
export function getTopLevelMenu(
  routeName: string,
  menus: App.GlobalMenuOption[],
  depth = 0
): App.GlobalMenuOption | undefined {
  if (depth > 10) return undefined; // 设置最大递归深度为10
  return menus.find(item => {
    if (item.routeName === routeName) return true;
    if (Array.isArray(item.children)) {
      return getTopLevelMenu(routeName, item.children, depth + 1);
    }
    return false;
  });
}
