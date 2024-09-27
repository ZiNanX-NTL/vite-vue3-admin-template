<template>
  <div class="h-full flex-1-hidden px-10px">
    <n-scrollbar
      :x-scrollable="theme.headerMenu.overflowMode === 'scroll'"
      class="h-full flex-1-hidden"
      content-class="h-full"
    >
      <div v-if="reloadFlag" class="h-full flex-y-center">
        <n-menu
          v-if="!theme.layout.isMenuSeparation"
          :value="activeKey"
          mode="horizontal"
          responsive
          :options="routeStore.menus"
          :inverted="theme.header.inverted"
          @update:value="handleUpdateMenu"
        />
        <n-menu
          v-else
          :value="theme.layout.isMenuInverted ? activeRootKey : activeKey"
          mode="horizontal"
          responsive
          :options="theme.layout.isMenuInverted ? routeStore.rootMenus : routeStore.childrenMenus"
          :inverted="theme.header.inverted"
          @update:value="handleUpdateRootMenu"
        />
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup>
import { useRouteStore, useThemeStore } from '@/store';
import { useReload } from '@/hooks';
import { useMenu } from '@/utils';

defineOptions({ name: 'HeaderMenu' });

const routeStore = useRouteStore();
const theme = useThemeStore();
const { reloadFlag, handleReload } = useReload();

const { activeKey, activeRootKey, handleUpdateMenu, handleUpdateRootMenu } = useMenu();

watch(
  () => theme.headerMenu.overflowMode,
  () => {
    handleReload();
  }
);
</script>

<style scoped>
:deep(.n-menu-item-content-header) {
  overflow: inherit !important;
}
:deep(.n-menu > .v-overflow) {
  justify-content: v-bind('theme.headerMenu.horizontalPosition');
}
</style>
