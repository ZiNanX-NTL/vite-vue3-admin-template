<script setup>
import { useThemeStore } from '@/store';
import { useBasicLayout, useIsMobile } from '@/utils';
import { useMixMenuContext } from '../../context';
import GlobalLogo from '../global-logo/index.vue';
import GlobalSearch from '../global-search/index.vue';
import {
  FullScreen,
  GlobalBreadcrumb,
  HeaderMenu,
  MenuCollapse,
  SettingButton,
  ThemeMode,
  UserAvatar
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

<template>
  <DarkModeContainer
    class="h-full shadow-[0_1px_2px_rgba(0,21,41,0.08)] relative"
    :class="mode === 'vertical-mix' ? 'z-30' : 'z-10'"
    :inverted="theme.header.inverted"
    :style="{ height: `${theme.header.height}px` }"
  >
    <NLayoutHeader class="flex-y-center h-full" :inverted="!theme.darkMode && theme.header.inverted">
      <GlobalLogo
        v-if="showLogo"
        :show-title="true"
        class="h-full"
        :class="{ 'px-25px': !theme.logo.isCustomizeWidth }"
        :style="{
          width: logoWidth,
        }"
      />
      <div class="flex-y-center flex-1-hidden h-full">
        <MenuCollapse
          v-if="
            mode !== 'horizontal'
              && (showMenuCollapse || isMobile)
              && theme.sider.showTrigger === 'headerIcon'
              && showMenuCollapseForMenuInverted
          "
        />
        <GlobalBreadcrumb
          v-if="!(showHeaderMenu || theme.layout.isMenuSeparation) && theme.header.crumb.visible && !isMobile"
        />
        <HeaderMenu v-if="showHeaderMenu || theme.layout.isMenuSeparation" />
      </div>
      <div class="flex h-full justify-end">
        <GlobalSearch />
        <FullScreen />
        <ThemeMode />
        <SettingButton v-if="showButton" />
        <UserAvatar />
      </div>
    </NLayoutHeader>
  </DarkModeContainer>
</template>

<style lang="scss" scoped></style>
