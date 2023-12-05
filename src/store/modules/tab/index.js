import { defineStore } from 'pinia';
import { useRouterPush } from '@/utils';
import { useThemeStore } from '../theme';
import { useRouteStore } from '../route';
import { getIndexInTabRoutesByRouteName, getTabRouteByVueRoute, getTabRoutes, isInTabRoutes } from './helpers';

export const useTabStore = defineStore('tab-store', {
  state: () => ({
    tabs: [],
    homeTab: {
      name: 'root',
      fullPath: '/',
      meta: {
        title: 'Root'
      },
      scrollPosition: {
        left: 0,
        top: 0
      }
    },
    activeTab: ''
  }),
  getters: {
    /** 当前激活状态的页签索引 */
    activeTabIndex(state) {
      const { tabs, activeTab } = state;
      return tabs.findIndex(tab => tab.fullPath === activeTab);
    }
  },
  actions: {
    /**
     * 初始化首页页签路由
     * @param routeHomeName - 路由首页的name
     * @param router - 路由实例
     */
    initHomeTab(routeHomeName, router) {
      const routes = router.getRoutes();
      const findHome = routes.find(item => item.name === routeHomeName);
      if (findHome && !findHome.children.length) {
        // 有子路由的不能作为Tab
        this.homeTab = getTabRouteByVueRoute(findHome);
      }
    },
    /**
     * 设置当前路由对应的页签为激活状态
     * @param fullPath - 路由fullPath
     */
    setActiveTab(fullPath) {
      this.activeTab = fullPath;
    },
    /** 初始化Tab状态 */
    iniTabStore(currentRoute) {
      const theme = useThemeStore();

      const tabs = theme.tab.isCache ? getTabRoutes() : [];

      const hasHome = getIndexInTabRoutesByRouteName(tabs, this.homeTab.name) > -1;
      if (!hasHome && this.homeTab.name !== 'root') {
        tabs.unshift(this.homeTab);
      }

      const isHome = currentRoute.fullPath === this.homeTab.fullPath;
      const index = getIndexInTabRoutesByRouteName(tabs, currentRoute.name);
      if (!isHome) {
        const currentTab = getTabRouteByVueRoute(currentRoute);
        if (!currentRoute.meta.multiTab) {
          if (index > -1) {
            tabs.splice(index, 1, currentTab);
          } else {
            tabs.push(currentTab);
          }
        } else {
          const hasCurrent = isInTabRoutes(tabs, currentRoute.fullPath);
          if (!hasCurrent) {
            tabs.push(currentTab);
          }
        }
      }

      this.tabs = tabs;
      this.setActiveTab(currentRoute.fullPath);
    },
    /**
     * 添加多页签
     * @param route - 路由
     */
    addTab(route) {
      const tab = getTabRouteByVueRoute(route);

      if (isInTabRoutes(this.tabs, tab.fullPath)) {
        return;
      }

      const index = getIndexInTabRoutesByRouteName(this.tabs, route.name);

      if (index === -1) {
        this.tabs.push(tab);
        return;
      }

      const { multiTab = false } = route.meta;
      if (!multiTab) {
        this.tabs.splice(index, 1, tab);
        return;
      }

      this.tabs.push(tab);
    },
    /**
     * 点击单个tab
     * @param fullPath - 路由fullPath
     */
    async handleClickTab(fullPath) {
      const { routerPush } = useRouterPush();

      const isActive = this.activeTab === fullPath;
      if (!isActive) {
        const navigationFailure = await routerPush(fullPath);
        if (!navigationFailure) this.setActiveTab(fullPath);
      }
    },
    /**
     * 删除多页签
     * @param fullPath - 路由fullPath
     */
    async removeTab(fullPath) {
      const { reCacheRoute } = useRouteStore();
      const { routerPush } = useRouterPush();

      const tabName = this.tabs.find(tab => tab.fullPath === fullPath)?.name;
      if (tabName) {
        await reCacheRoute(tabName);
      }

      const isActive = this.activeTab === fullPath;
      const updateTabs = this.tabs.filter(tab => tab.fullPath !== fullPath);
      if (!isActive) {
        this.tabs = updateTabs;
      }
      if (isActive && updateTabs.length) {
        const activePath = updateTabs[updateTabs.length - 1].fullPath;
        const navigationFailure = await routerPush(activePath);
        if (!navigationFailure) {
          this.tabs = updateTabs;
          this.setActiveTab(activePath);
        }
      }
    }
  }
});
