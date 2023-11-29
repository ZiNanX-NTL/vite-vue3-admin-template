import { useEventListener } from '@vueuse/core';
import { useThemeStore } from '@/store';

/** 全局事件 */
export function useGlobalEvents() {
  const theme = useThemeStore();

  /** 页面离开时缓存主题配置 */
  useEventListener(window, 'beforeunload', () => {
    theme.cacheThemeSettings();
  });
}
