import { useAppStore, useThemeStore } from '@/store';

/** 固定页面高度 */
export default function useHeight() {
  const theme = useThemeStore();
  const app = useAppStore();

  const heightStyle = computed(() => {
    if (app.contentFull) {
      return { height: '100vh' };
    }
    return {
      height: theme.tab.visible
        ? `calc(100vh - ${theme.header.height}px - 52px)`
        : `calc(100vh - ${theme.header.height}px)`
    };
  });
  return { heightStyle };
}
