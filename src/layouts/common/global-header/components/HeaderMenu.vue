<script setup lang="ts">
import type { MenuOption } from 'naive-ui';
import { useReload } from '@/hooks';
import { useRouteStore, useThemeStore } from '@/store';
import { useMenu, useMixMenuContext } from '../../../context';

const routeStore = useRouteStore();
const theme = useThemeStore();
const { reloadFlag, handleReload } = useReload();

const {
  firstLevelMenus,
  childLevelMenus,
  activeFirstLevelMenuKey,
  setActiveFirstLevelMenuKey,
  isActiveFirstLevelMenuHasChildren
} = useMixMenuContext();
const { activeKey, handleUpdateMenu } = useMenu();

/** 更新选中菜单分离混合路由菜单 */
function handleUpdateMixMenu(key: string, item: MenuOption) {
  if (theme.layout.isMenuInverted) {
    setActiveFirstLevelMenuKey(key);

    if (!isActiveFirstLevelMenuHasChildren.value) {
      handleUpdateMenu(key, item);
    } else {
      // 默认选中子菜单的第一个
      handleUpdateMenu(childLevelMenus.value[0].key, childLevelMenus.value[0]);
    }
  } else {
    handleUpdateMenu(key, item);
  }
}

watch(
  () => theme.headerMenu.overflowMode,
  () => {
    handleReload();
  }
);
</script>

<template>
  <div class="px-10px flex-1-hidden h-full">
    <NScrollbar
      :x-scrollable="theme.headerMenu.overflowMode === 'scroll'"
      class="flex-1-hidden h-full"
      content-class="h-full"
    >
      <div v-if="reloadFlag" class="flex-y-center h-full">
        <NMenu
          v-if="!theme.layout.isMenuSeparation"
          :value="activeKey"
          mode="horizontal"
          responsive
          :options="routeStore.menus"
          :inverted="theme.header.inverted"
          @update:value="handleUpdateMenu"
        />
        <NMenu
          v-else
          :value="theme.layout.isMenuInverted ? activeFirstLevelMenuKey : activeKey"
          mode="horizontal"
          responsive
          :options="theme.layout.isMenuInverted ? firstLevelMenus : childLevelMenus"
          :inverted="theme.header.inverted"
          @update:value="handleUpdateMixMenu"
        />
      </div>
    </NScrollbar>
  </div>
</template>

<style scoped>
:deep(.n-menu-item-content-header) {
  overflow: inherit !important;
}
:deep(.n-menu > .v-overflow) {
  justify-content: v-bind('theme.headerMenu.horizontalPosition');
}
</style>
