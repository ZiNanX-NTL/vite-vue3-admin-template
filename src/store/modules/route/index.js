import { defineStore } from 'pinia';
import {
  constantRoutes,
  routes as staticRoutes,
  router,
  ROOT_ROUTE,
  getConstantRouteNames,
  transformRouteNameToRoutePath,
  transformRoutePathToRouteName,
  filterAuthRoutesByUserPermission,
  filterAuthRoutesByUserRole,
  transformAuthRouteToMenu,
  transformAuthRouteToRootMenu,
  transformAuthRouteToVueRoutes,
  getCacheRoutes,
  transformAuthRouteToSearchMenus,
  sortRoutesByOrder
} from '@/router';
import { fetchGetUserRoutes } from '@/api';
import { useAuthStore } from '../auth';
import { useAppStore } from '../app';
import { useTabStore } from '../tab';

export const useRouteStore = defineStore('route-store', {
  state: () => ({
    authRouteMode: import.meta.env.VITE_AUTH_ROUTE_MODE,
    permissionMode: import.meta.env.VITE_PERMISSION_MODE,
    roleKey: import.meta.env.VITE_ROLE_KEY,
    permissionKey: import.meta.env.VITE_PERMISSION_KEY,
    isInitAuthRoute: false,
    removeRouteFns: [],
    routeHomeName: transformRoutePathToRouteName(import.meta.env.VITE_ROUTE_HOME_PATH),
    menus: [],
    rootMenus: [],
    childrenMenus: [],
    cacheRoutes: [],
    searchMenus: []
  }),
  actions: {
    /** 重置路由的store */
    resetRouteStore() {
      this.resetVueRoutes();
      this.$reset();
    },
    /** 重置路由数据，保留固定路由 */
    resetVueRoutes() {
      this.removeRouteFns.forEach(fn => fn());
      this.removeRouteFns.length = 0;
    },
    /**
     * 是否是固定路由
     * @param name 路由名称
     */
    isConstantRoute(name) {
      const constantRouteNames = getConstantRouteNames(constantRoutes);
      return constantRouteNames.includes(name);
    },
    /**
     * 是否是有效的固定路由
     * @param name 路由名称
     */
    isValidConstantRoute(name) {
      const NOT_FOUND_PAGE_NAME = 'not-found';
      const constantRouteNames = getConstantRouteNames(constantRoutes);
      return constantRouteNames.includes(name) && name !== NOT_FOUND_PAGE_NAME;
    },
    /** 初始化权限路由 */
    async initAuthRoute() {
      const { initHomeTab } = useTabStore();

      if (this.authRouteMode === 'dynamic') {
        await this.initDynamicRoute();
      } else {
        await this.initStaticRoute();
      }

      initHomeTab();
    },
    /** 初始化静态路由 */
    async initStaticRoute() {
      const auth = useAuthStore();

      let routes;
      if (this.permissionMode === 'RBAC') {
        routes = filterAuthRoutesByUserPermission(staticRoutes, auth.userInfo[this.roleKey]);
      } else {
        routes = filterAuthRoutesByUserRole(staticRoutes, [
          ...auth.userInfo[this.roleKey],
          ...auth.userInfo[this.permissionKey]
        ]);
      }
      this.handleAuthRoute(routes);

      this.isInitAuthRoute = true;
    },
    /** Init dynamic auth route */
    async initDynamicRoute() {
      const { data, error } = await fetchGetUserRoutes();

      if (!error) {
        const { routes, home } = data;

        const sortRoutes = sortRoutesByOrder(routes);
        this.handleAuthRoute(sortRoutes);
        this.setRouteHome(home);
        this.handleUpdateRootRouteRedirect(home);

        this.isInitAuthRoute = true;
      }
    },
    /**
     * 处理权限路由
     * @param routes - 权限路由
     */
    handleAuthRoute(routes) {
      const vueRoutes = transformAuthRouteToVueRoutes(routes);
      this.resetVueRoutes();
      this.addRoutesToVueRouter(vueRoutes);

      this.menus = transformAuthRouteToMenu(routes);
      this.rootMenus = transformAuthRouteToRootMenu(routes);
      this.searchMenus = transformAuthRouteToSearchMenus(routes);
      this.cacheRoutes = getCacheRoutes(vueRoutes);
    },

    /**
     * 设置childrenMenus
     * @param routes - 权限路由
     */
    setChildrenMenus(routes = []) {
      this.childrenMenus = routes || [];
    },

    /**
     * Add routes to vue router
     *
     * @param routes Vue routes
     */
    addRoutesToVueRouter(routes) {
      routes.forEach(route => {
        const removeFn = router.addRoute(route);
        this.addRemoveRouteFn(removeFn);
      });
    },
    /**
     * Add remove route fn
     *
     * @param fn
     */
    addRemoveRouteFn(fn) {
      this.removeRouteFns.push(fn);
    },

    /**
     * Set route home
     *
     * @param routeKey Route key
     */
    setRouteHome(routeKey) {
      this.routeHomeName = routeKey;
    },
    /**
     * Update root route redirect when auth route mode is dynamic
     *
     * @param redirectKey Redirect route key
     */
    handleUpdateRootRouteRedirect(redirectKey) {
      const redirect = transformRouteNameToRoutePath(redirectKey);

      if (redirect) {
        const rootRoute = { ...ROOT_ROUTE, redirect };

        router.removeRoute(rootRoute.name);

        const [rootVueRoute] = transformAuthRouteToVueRoutes([rootRoute]);

        router.addRoute(rootVueRoute);
      }
    },
    /** 添加某个缓存路由 */
    addCacheRoute(name) {
      const index = this.cacheRoutes.indexOf(name);
      if (index === -1) {
        this.cacheRoutes.push(name);
      }
    },
    /** 从缓存路由中去除某个路由 */
    removeCacheRoute(name) {
      const index = this.cacheRoutes.indexOf(name);
      if (index > -1) {
        this.cacheRoutes.splice(index, 1);
      }
    },
    /** 重新刷新某个缓存路由 */
    async removeCacheEntry(name) {
      const isCached = this.cacheRoutes.includes(name);
      if (isCached) {
        this.removeCacheRoute(name);
        setTimeout(() => {
          this.addCacheRoute(name);
        }, 0);
      }
    },
    /**
     * 重新缓存路由
     */
    async reCacheRoute(name) {
      const { reloadPage } = useAppStore();

      const isCached = this.cacheRoutes.includes(name);

      if (isCached) {
        this.removeCacheRoute(name);
      }

      await reloadPage();

      if (isCached) {
        this.addCacheRoute(name);
      }
    }
  }
});
