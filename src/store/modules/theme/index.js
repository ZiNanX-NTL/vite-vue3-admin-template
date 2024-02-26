import { defineStore } from 'pinia';
import { darkTheme } from 'naive-ui';
import { localStg } from '@/utils';
import { initThemeSettings, getOverrides } from './helpers';

export const useThemeStore = defineStore('theme-store', {
  state: () => initThemeSettings(),
  getters: {
    /** naive-ui暗黑主题 */
    naiveTheme(state) {
      return state.darkMode ? darkTheme : undefined;
    },
    /** naiveUI的主题配置 */
    naiveThemeOverrides(state) {
      const overrides = getOverrides(state);
      return overrides;
    },
    /** 页面动画模式 */
    pageAnimateMode(state) {
      return state.page.animate ? state.page.animateMode : undefined;
    }
  },
  actions: {
    /** 缓存主题配置 */
    cacheThemeSettings() {
      const isProd = import.meta.env.PROD;
      if (isProd) {
        localStg.set('themeSettings', this.$state);
      }
    },
    /** 设置暗黑模式 */
    setDarkMode(darkMode) {
      this.darkMode = darkMode;
    },
    /** 设置自动跟随系统主题 */
    setFollowSystemTheme(visible) {
      this.followSystemTheme = visible;
    },
    /** 自动跟随系统主题 */
    setAutoFollowSystemMode(darkMode) {
      if (this.followSystemTheme) {
        this.darkMode = darkMode;
      }
    },
    /** 设置侧边栏反转色 */
    setSiderInverted(isInverted) {
      this.sider.inverted = isInverted;
    },
    /** 设置头部反转色 */
    setHeaderInverted(isInverted) {
      this.header.inverted = isInverted;
    },
    /** 设置布局模式 */
    setLayoutMode(mode) {
      this.layout.mode = mode;
    },
    /** 设置系统主题颜色 */
    setThemeColor(themeColor) {
      this.themeColor = themeColor;
    },
    /** 设置滚动模式 */
    setScrollMode(mode) {
      this.scrollMode = mode;
    },
    /** 设置水平模式的菜单的位置 */
    setHorizontalMenuPosition(position) {
      this.headerMenu.horizontalPosition = position;
    },
    /** 设置水平模式的菜单溢出的处理方式 */
    setHorizontalMenuOverflowMode(mode) {
      this.headerMenu.overflowMode = mode;
    },
    /** 设置头部高度 */
    setHeaderHeight(height) {
      if (height) {
        this.header.height = height;
      }
    },
    /** 侧边栏宽度 */
    setSiderWidth(width) {
      if (width) {
        this.sider.width = width;
      }
    },
    /** 设置是否自定义logo宽度 */
    setIsCustomizeWidth(isCustomize) {
      this.logo.isCustomizeWidth = isCustomize;
    },
    /** 设置自定义logo宽度 */
    setLogoWidth(width) {
      this.logo.width = width;
    },
    /** 设置头部面包屑可见 */
    setHeaderCrumbVisible(visible) {
      this.header.crumb.visible = visible;
    },
    /** 设置头部面包屑图标可见 */
    setHeaderCrumbIconVisible(visible) {
      this.header.crumb.showIcon = visible;
    },
    /** 设置多页签可见 */
    setTabVisible(visible) {
      this.tab.visible = visible;
    },
    /** 设置多页签翻页风格 */
    setTabMode(mode) {
      this.tab.scrollMode = mode;
    },
    /** 设置切换页面时是否过渡动画 */
    setPageIsAnimate(animate) {
      this.page.animate = animate;
    },
    /** 设置页面过渡动画类型 */
    setPageAnimateMode(mode) {
      this.page.animateMode = mode;
    },
    /** 设置菜单折叠方式 */
    setSiderShowTrigger(mode) {
      this.sider.showTrigger = mode;
    }
  }
});
