/**
 * 根据用户权限过滤路由
 * @param routes - 权限路由
 * @param permission - 权限
 */
export function filterAuthRoutesByUserRole(routes, role) {
  return routes.map(route => filterAuthRouteByUserRole(route, role)).flat(1);
}

/**
 * 根据用户权限过滤单个路由
 * @param route - 单个权限路由
 * @param role - 权限
 */
function filterAuthRouteByUserRole(route, role) {
  const filterRoute = { ...route };
  const hasPermission = !route.meta.permissions || role === 'super' || route.meta.permissions.includes(role);

  if (filterRoute.children) {
    const filterChildren = filterRoute.children.map(item => filterAuthRouteByUserRole(item, role)).flat(1);
    Object.assign(filterRoute, { children: filterChildren });
  }
  return hasPermission ? [filterRoute] : [];
}

/**
 * 根据用户权限过滤路由
 * @param routes - 权限路由
 * @param permission - 权限
 */
export function filterAuthRoutesByUserPermission(routes, permissions) {
  return routes.map(route => filterAuthRouteByUserPermission(route, permissions)).flat(1);
}

/**
 * 根据用户权限过滤单个路由
 * @param route - 单个权限路由
 * @param permission - 权限
 */
function filterAuthRouteByUserPermission(route, permissions) {
  const filterRoute = { ...route };
  const hasPermission =
    !route.meta.permissions ||
    permissions.some(permission => {
      return route.meta.permissions.includes(permission);
    });

  if (filterRoute.children) {
    const filterChildren = filterRoute.children.map(item => filterAuthRouteByUserPermission(item, permissions)).flat(1);
    Object.assign(filterRoute, { children: filterChildren });
  }
  return hasPermission ? [filterRoute] : [];
}
