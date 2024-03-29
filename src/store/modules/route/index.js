import { defineStore } from 'pinia';
import {
  constantRoutes,
  routes as staticRoutes,
  router,
  getConstantRouteNames,
  transformRoutePathToRouteName,
  filterAuthRoutesByUserPermission,
  filterAuthRoutesByUserRole,
  transformAuthRouteToMenu,
  transformAuthRouteToVueRoutes,
  getCacheRoutes,
  transformAuthRouteToSearchMenus
} from '@/router';
import { useAuthStore } from '../auth';
import { useAppStore } from '../app';
import { useTabStore } from '../tab';

export const useRouteStore = defineStore('route-store', {
  state: () => ({
    authRouteMode: import.meta.env.VITE_AUTH_ROUTE_MODE,
    isInitAuthRoute: false,
    routeHomeName: transformRoutePathToRouteName(import.meta.env.VITE_ROUTE_HOME_PATH),
    menus: [],
    cacheRoutes: [],
    searchMenus: []
  }),
  actions: {
    /** 重置路由的store */
    resetRouteStore() {
      this.resetRoutes();
      this.$reset();
    },
    /** 重置路由数据，保留固定路由 */
    resetRoutes() {
      const routes = router.getRoutes();
      routes.forEach(route => {
        const name = route.name || 'root';
        if (!this.isConstantRoute(name)) {
          router.removeRoute(name);
        }
      });
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
      if (this.authRouteMode === 'dynamic') {
        // await this.initDynamicRoute();
      } else {
        await this.initStaticRoute();
      }
    },
    /** 初始化静态路由 */
    async initStaticRoute() {
      const { initHomeTab } = useTabStore();
      const auth = useAuthStore();
      const permissionMode = import.meta.env.VITE_PERMISSION_MODE;
      const permissionKey = import.meta.env.VITE_PERMISSION_KEY;

      let routes;
      if (permissionMode === 'RBAC') {
        routes = filterAuthRoutesByUserPermission(staticRoutes, auth.userInfo[permissionKey]);
      } else {
        routes = filterAuthRoutesByUserRole(staticRoutes, auth.userInfo[permissionKey]);
      }
      this.handleAuthRoute(routes);

      initHomeTab(this.routeHomeName, router);

      this.isInitAuthRoute = true;
    },
    /**
     * 处理权限路由
     * @param routes - 权限路由
     */
    handleAuthRoute(routes) {
      this.menus = transformAuthRouteToMenu(routes);
      this.searchMenus = transformAuthRouteToSearchMenus(routes);

      const vueRoutes = transformAuthRouteToVueRoutes(routes);

      vueRoutes.forEach(route => {
        router.addRoute(route);
      });

      this.cacheRoutes = getCacheRoutes(vueRoutes);
    },
    /** 从缓存路由中去除某个路由 */
    removeCacheRoute(name) {
      const index = this.cacheRoutes.indexOf(name);
      if (index > -1) {
        this.cacheRoutes.splice(index, 1);
      }
    },
    /** 添加某个缓存路由 */
    addCacheRoute(name) {
      const index = this.cacheRoutes.indexOf(name);
      if (index === -1) {
        this.cacheRoutes.push(name);
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
