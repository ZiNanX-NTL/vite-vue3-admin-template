import { computed, watch } from 'vue';
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { useAppStore, useThemeStore } from '@/store';

export function useBasicLayout() {
  const app = useAppStore();
  const theme = useThemeStore();
  const breakpoints = useBreakpoints(breakpointsTailwind);

  const mode = computed(() => {
    return theme.layout.mode;
  });

  const isMobile = breakpoints.smaller('sm');

  // 各种布局的布局参数
  const layoutsProps = {
    vertical: {
      showHeader: false,
      showMixHeader: true,
      showSider: true,
      showMixSider: false
    },
    'vertical-mix': {
      showHeader: true,
      showMixHeader: false,
      showSider: false,
      showMixSider: true
    },
    horizontal: {
      showHeader: true,
      showMixHeader: false,
      showSider: false,
      showMixSider: false
    }
  };
  const layoutProps = computed(() => layoutsProps[theme.layout.mode]);

  // header各种布局下的参数
  const layoutHeaderProps = {
    vertical: {
      showLogo: false,
      showHeaderMenu: false,
      showMenuCollapse: true
    },
    'vertical-mix': {
      showLogo: true,
      showHeaderMenu: false,
      showMenuCollapse: true
    },
    horizontal: {
      showLogo: true,
      showHeaderMenu: true,
      showMenuCollapse: false
    }
  };
  const headerProps = computed(() => layoutHeaderProps[theme.layout.mode]);

  // sider各种布局下的参数
  const layoutSiderProps = {
    vertical: {
      showLogo: true
    },
    'vertical-mix': {
      showLogo: false
    },
    horizontal: {
      showLogo: false
    }
  };
  const siderProps = computed(() => layoutSiderProps[theme.layout.mode]);

  watch(
    isMobile,
    newValue => {
      if (newValue) {
        app.setSiderCollapse(true);
      }
    },
    { immediate: true }
  );

  return {
    mode,
    isMobile,
    layoutProps,
    headerProps,
    siderProps
  };
}
