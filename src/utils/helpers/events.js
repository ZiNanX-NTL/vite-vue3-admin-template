import { useEventListener } from '@vueuse/core';
import { useTabStore, useThemeStore } from '@/store';

/** 全局事件 */
export function useGlobalEvents() {
  const theme = useThemeStore();
  const tab = useTabStore();

  /** 页面离开时缓存主题配置 */
  useEventListener(window, 'beforeunload', () => {
    theme.cacheThemeSettings();
    tab.cacheTabRoutes();
  });
}
