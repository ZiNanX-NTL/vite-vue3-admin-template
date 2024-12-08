import type { RouteRecordRaw } from 'vue-router';
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
import { useMenu } from '@/utils';
import { fetchGetUserRoutes } from '@/api';
import { useAuthStore } from '../auth';
import { useAppStore } from '../app';
import { useTabStore } from '../tab';

interface RouteState {
  /**
   * 权限路由模式:
   * - static - 前端声明的静态
   * - dynamic - 后端返回的动态
   */
  authRouteMode: ImportMetaEnv['VITE_AUTH_ROUTE_MODE'];
  /** 用户权限模式 */
  permissionMode: ImportMetaEnv['VITE_PERMISSION_MODE'];
  /** 角色权限字段 */
  roleKey: ImportMetaEnv['VITE_ROLE_KEY'];
  /** 权限字段 */
  permissionKey: ImportMetaEnv['VITE_PERMISSION_KEY'];
  /** 是否初始化了权限路由 */
  isInitAuthRoute: boolean;
  /** 删除路由函数队列 */
  removeRouteFns: (() => void)[];
  /** 路由首页name(前端静态路由时生效，后端动态路由该值会被后端返回的值覆盖) */
  routeHomeName: string;
  /** 菜单 */
  menus: App.GlobalMenuOption[];
  /** 菜单分离一级菜单 */
  rootMenus: App.GlobalMenuOption[];
  /** 菜单分离子菜单 */
  childrenMenus: App.GlobalMenuOption[];
  /** 搜索的菜单 */
  searchMenus: AuthRoute.Route[];
  /** 缓存的路由名称 */
  cacheRoutes: string[];
  /** 临时缓存的路由名称 */
  tempCacheRoutes: string[];
  /** 是否是简洁模式 */
  isSimpleMode: boolean;
}

export const useRouteStore = defineStore('route-store', {
  state: (): RouteState => ({
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
    searchMenus: [],
    cacheRoutes: [],
    tempCacheRoutes: [],
    isSimpleMode: false
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
    isConstantRoute(name: string) {
      const constantRouteNames = getConstantRouteNames(constantRoutes);
      return constantRouteNames.includes(name);
    },
    /**
     * 是否是有效的固定路由
     * @param name 路由名称
     */
    isValidConstantRoute(name: string) {
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
        routes = filterAuthRoutesByUserPermission(staticRoutes, [
          ...auth.userInfo[this.roleKey],
          ...auth.userInfo[this.permissionKey]
        ]);
      } else {
        routes = filterAuthRoutesByUserRole(staticRoutes, auth.userInfo[this.roleKey]);
      }
      this.handleAuthRoute(routes);

      this.isInitAuthRoute = true;
    },
    /** Init dynamic auth route */
    async initDynamicRoute() {
      const { data, error } = await fetchGetUserRoutes();

      if (!error) {
        const { routes, home } = data as any;

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
    handleAuthRoute(routes: AuthRoute.Route[]) {
      const vueRoutes = transformAuthRouteToVueRoutes(routes);
      this.resetVueRoutes();
      this.addRoutesToVueRouter(vueRoutes);

      (this.menus as App.GlobalMenuOption[]) = transformAuthRouteToMenu(routes);
      (this.rootMenus as App.GlobalMenuOption[]) = transformAuthRouteToRootMenu(routes);
      this.searchMenus = transformAuthRouteToSearchMenus(routes);
      this.cacheRoutes = getCacheRoutes(vueRoutes);
    },

    /**
     * 设置childrenMenus
     * @param routes - 权限路由
     */
    setChildrenMenus(routes: App.GlobalMenuOption[] = []) {
      (this.childrenMenus as App.GlobalMenuOption[]) = routes || [];
    },

    /**
     * Add routes to vue router
     *
     * @param routes Vue routes
     */
    addRoutesToVueRouter(routes: RouteRecordRaw[]) {
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
    addRemoveRouteFn(fn: () => void) {
      this.removeRouteFns.push(fn);
    },

    /**
     * Set route home
     *
     * @param routeKey Route key
     */
    setRouteHome(routeKey: string) {
      this.routeHomeName = routeKey;
    },
    /**
     * Update root route redirect when auth route mode is dynamic
     *
     * @param redirectKey Redirect route key
     */
    handleUpdateRootRouteRedirect(redirectKey: string) {
      const redirect = transformRouteNameToRoutePath(redirectKey);

      if (redirect) {
        const rootRoute = { ...ROOT_ROUTE, redirect };

        router.removeRoute(rootRoute.name);

        const [rootVueRoute] = transformAuthRouteToVueRoutes([rootRoute]);

        router.addRoute(rootVueRoute);
      }
    },
    /** 添加某个缓存路由 */
    addCacheRoute(name: string) {
      const index = this.cacheRoutes.indexOf(name);
      if (index === -1) {
        this.cacheRoutes.push(name);
      }
    },
    /** 从缓存路由中去除某个路由 */
    removeCacheRoute(name: string) {
      const index = this.cacheRoutes.indexOf(name);
      if (index > -1) {
        this.cacheRoutes.splice(index, 1);
      }
    },
    /** 重新刷新某个缓存路由 */
    async removeCacheEntry(name: string) {
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
    async reCacheRoute(name: string) {
      const { reloadPage } = useAppStore();

      const isCached = this.cacheRoutes.includes(name);

      if (isCached) {
        this.removeCacheRoute(name);
      }

      await reloadPage();

      if (isCached) {
        this.addCacheRoute(name);
      }
    },
    /** 添加某个缓存路由 */
    addTempCacheRoute(name: string) {
      const index = this.tempCacheRoutes.indexOf(name);
      if (index === -1) {
        this.tempCacheRoutes.push(name);
      }
    },
    /** 从缓存路由中去除某个路由 */
    removeTempCacheRoute(name: string) {
      const index = this.tempCacheRoutes.indexOf(name);
      if (index > -1) {
        this.tempCacheRoutes.splice(index, 1);
      }
    },
    /** 设置简洁模式 */
    setSimpleMode(isSimpleMode: boolean) {
      const { setChildrenMenusFromTopLevelMenu } = useMenu(false);
      this.isSimpleMode = isSimpleMode;
      this.initAuthRoute();
      setChildrenMenusFromTopLevelMenu();
    }
  }
});
