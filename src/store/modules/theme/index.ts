import { defineStore } from 'pinia';
import { darkTheme } from 'naive-ui';
import { generateColorScheme, sessionStg } from '@/utils';
import { getOverrides, initThemeSettings } from './helpers';

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
    /** 配色方案色板 */
    colorScheme(state) {
      const color = state?.naiveThemeOverrides?.common?.primaryColor || state.themeColor;
      return generateColorScheme(color);
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
        sessionStg.set('themeSettings', this.$state);
      }
    },
    /** 设置暗黑模式 */
    setDarkMode(darkMode: boolean) {
      this.darkMode = darkMode;
    },
    /** 设置自动跟随系统主题 */
    setFollowSystemTheme(visible: boolean) {
      this.followSystemTheme = visible;
    },
    /** 自动跟随系统主题 */
    setAutoFollowSystemMode(darkMode: boolean) {
      if (this.followSystemTheme) {
        this.darkMode = darkMode;
      }
    },
    /** 设置侧边栏反转色 */
    setSiderInverted(isInverted: boolean) {
      this.sider.inverted = isInverted;
    },
    /** 设置头部反转色 */
    setHeaderInverted(isInverted: boolean) {
      this.header.inverted = isInverted;
    },
    /** 设置布局模式 */
    setLayoutMode(mode: UnionKey.ThemeLayoutMode) {
      // 重置菜单左上分离
      if (mode === 'horizontal') {
        this.layout.isMenuSeparation = false;
      }
      this.layout.mode = mode;
    },
    /** 设置菜单左上分离 */
    setMenuSeparation(isSeparation: boolean) {
      this.layout.isMenuSeparation = isSeparation;
    },
    /** 设置菜单左上反转 */
    setMenuInverted(isMenuInverted: boolean) {
      this.layout.isMenuInverted = isMenuInverted;
    },
    /** 设置系统主题颜色 */
    setThemeColor(themeColor: string) {
      this.themeColor = themeColor;
    },
    /** 设置滚动模式 */
    setScrollMode(mode: UnionKey.ThemeScrollMode) {
      this.scrollMode = mode;
    },
    /** 设置水平模式的菜单的位置 */
    setHorizontalMenuPosition(position: UnionKey.ThemeHorizontalMenuPosition) {
      this.headerMenu.horizontalPosition = position;
    },
    /** 设置水平模式的菜单溢出的处理方式 */
    setHorizontalMenuOverflowMode(mode: UnionKey.ThemeOverflowMode) {
      this.headerMenu.overflowMode = mode;
    },
    /** 设置头部高度 */
    setHeaderHeight(height: number) {
      if (height) {
        this.header.height = height;
      }
    },
    /** 侧边栏宽度 */
    setSiderWidth(width: number) {
      if (width) {
        this.sider.width = width;
      }
    },
    /** 设置是否自定义logo宽度 */
    setIsCustomizeWidth(isCustomize: boolean) {
      this.logo.isCustomizeWidth = isCustomize;
    },
    /** 设置自定义logo宽度 */
    setLogoWidth(width: number) {
      this.logo.width = width;
    },
    /** 设置头部面包屑可见 */
    setHeaderCrumbVisible(visible: boolean) {
      this.header.crumb.visible = visible;
    },
    /** 设置头部面包屑图标可见 */
    setHeaderCrumbIconVisible(visible: boolean) {
      this.header.crumb.showIcon = visible;
    },
    /** 设置多页签可见 */
    setTabVisible(visible: boolean) {
      this.tab.visible = visible;
    },
    /** 设置多页签翻页风格 */
    setTabMode(mode: UnionKey.TabScrollMode) {
      this.tab.scrollMode = mode;
    },
    /** 设置切换页面时是否过渡动画 */
    setPageIsAnimate(animate: boolean) {
      this.page.animate = animate;
    },
    /** 设置页面过渡动画类型 */
    setPageAnimateMode(mode: UnionKey.ThemeAnimateMode) {
      this.page.animateMode = mode;
    },
    /** 设置菜单折叠方式 */
    setSiderShowTrigger(mode: UnionKey.SiderShowTrigger) {
      this.sider.showTrigger = mode;
    }
  }
});
