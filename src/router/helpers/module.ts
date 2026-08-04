/**
 * 权限路由排序
 *
 * @param routes - 权限路由
 */
export function sortRoutesByOrder(routes: AuthRoute.Route[]) {
  return routes
    .sort((next, pre) => {
      const nextOrder = next.meta?.order;
      const preOrder = pre.meta?.order;

      if (nextOrder == null)
        return preOrder == null ? 0 : 1;
      if (preOrder == null)
        return -1;

      return Number(nextOrder) - Number(preOrder);
    })
    .map(i => {
      if (i.children)
        sortRoutesByOrder(i.children);
      return i;
    });
}

/**
 * 处理全部导入的路由模块
 *
 * @param modules - 路由模块
 */
export function handleModuleRoutes(modules: AuthRoute.RouteModule) {
  const routes: AuthRoute.Route[] = [];

  Object.keys(modules).forEach(key => {
    const item = modules[key].default;
    if (item) {
      routes.push(item);
    } else {
      window.console.error(`路由模块解析出错: key = ${key}`);
    }
  });

  return sortRoutesByOrder(routes);
}
