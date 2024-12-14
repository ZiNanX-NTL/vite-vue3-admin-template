<template>
  <dark-mode-container
    class="relative h-full shadow-[0_1px_2px_rgba(0,21,41,0.08)]"
    :class="mode === 'vertical-mix' ? 'z-30' : 'z-10'"
    :inverted="theme.header.inverted"
    :style="{ height: theme.header.height + 'px' }"
  >
    <n-layout-header class="h-full flex-y-center" :inverted="!theme.darkMode && theme.header.inverted">
      <global-logo
        v-if="showLogo"
        :show-title="true"
        class="h-full"
        :class="{ 'px-25px': !theme.logo.isCustomizeWidth }"
        :style="{
          width: logoWidth
        }"
      />
      <div class="h-full flex-y-center flex-1-hidden">
        <menu-collapse
          v-if="
            mode !== 'horizontal' &&
            (showMenuCollapse || isMobile) &&
            theme.sider.showTrigger === 'headerIcon' &&
            showMenuCollapseForMenuInverted
          "
        />
        <global-breadcrumb
          v-if="!(showHeaderMenu || theme.layout.isMenuSeparation) && theme.header.crumb.visible && !isMobile"
        />
        <header-menu v-if="showHeaderMenu || theme.layout.isMenuSeparation" />
      </div>
      <div class="h-full flex justify-end">
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
import { useBasicLayout, useIsMobile } from '@/utils';
import GlobalLogo from '../global-logo/index.vue';
import GlobalSearch from '../global-search/index.vue';
import { useMixMenuContext } from '../../context';
import {
  MenuCollapse,
  GlobalBreadcrumb,
  HeaderMenu,
  FullScreen,
  ThemeMode,
  UserAvatar,
  SettingButton
} from './components';

defineProps({
  /** 显示logo */
  showLogo: Boolean,
  /** 显示头部菜单 */
  showHeaderMenu: Boolean,
  /** 显示菜单折叠按钮 */
  showMenuCollapse: Boolean
});

const theme = useThemeStore();
const { mode } = useBasicLayout();
const isMobile = useIsMobile();
const { isActiveFirstLevelMenuHasChildren } = useMixMenuContext();

const showMenuCollapseForMenuInverted = computed(() => {
  if (!theme.layout.isMenuSeparation || !theme.layout.isMenuInverted) {
    return true;
  }
  return isActiveFirstLevelMenuHasChildren.value;
});

const showButton = import.meta.env.DEV;

/** logo的宽度 */
const logoWidth = computed(() => {
  if (theme.logo.isCustomizeWidth) {
    return `${theme.logo.width}px`;
  }
  return `unset`;
});
</script>

<style lang="scss" scoped></style>
