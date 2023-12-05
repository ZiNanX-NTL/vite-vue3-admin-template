import { defineStore } from 'pinia';
import { useThemeStore } from '../theme';
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
    }
  }
});
