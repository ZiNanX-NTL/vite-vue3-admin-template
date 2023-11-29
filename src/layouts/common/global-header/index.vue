<template>
  <dark-mode-container
    class="h-full shadow-[0_1px_2px_rgba(0,21,41,0.08)] relative"
    :class="mode === 'vertical-mix' ? 'z-3' : 'z-1'"
    :inverted="theme.header.inverted"
    :style="{ height: theme.header.height + 'px' }"
  >
    <n-layout-header class="flex-y-center h-full" :inverted="!theme.darkMode && theme.header.inverted">
      <global-logo v-if="showLogo" :show-title="true" class="h-full" :style="{ width: theme.sider.width + 'px' }" />
      <div v-if="!showHeaderMenu" class="flex-1-hidden flex-y-center h-full">
        <menu-collapse v-if="(showMenuCollapse || isMobile) && theme.sider.showTrigger === 'headerIcon'" />
        <global-breadcrumb v-if="theme.header.crumb.visible && !isMobile" />
      </div>
      <header-menu v-else />
      <div class="flex justify-end h-full">
        <global-search />
        <full-screen />
        <theme-mode />
        <setting-button v-if="showButton" />
        <user-avatar />
      </div>
    </n-layout-header>
  </dark-mode-container>
</template>

<script setup>
import { useThemeStore } from '@/store';
import { useBasicLayout } from '@/utils';
import GlobalLogo from '../global-logo/index.vue';
import GlobalSearch from '../global-search/index.vue';
import {
  MenuCollapse,
  GlobalBreadcrumb,
  HeaderMenu,
  FullScreen,
  ThemeMode,
  UserAvatar,
  SettingButton
} from './components';

defineOptions({ name: 'GlobalHeader' });
defineProps({
  /** 显示logo */
  showLogo: Boolean,
  /** 显示头部菜单 */
  showHeaderMenu: Boolean,
  /** 显示菜单折叠按钮 */
  showMenuCollapse: Boolean
});

const theme = useThemeStore();
const { mode, isMobile } = useBasicLayout();

const showButton = import.meta.env.DEV;
</script>

<style lang="scss" scoped></style>
