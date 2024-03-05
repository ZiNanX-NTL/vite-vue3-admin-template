<template>
  <div class="h-full flex-1-hidden px-10px">
    <n-scrollbar
      :x-scrollable="theme.headerMenu.overflowMode === 'scroll'"
      class="h-full flex-1-hidden"
      content-class="h-full"
    >
      <div class="h-full flex-y-center">
        <n-menu
          :value="activeKey"
          mode="horizontal"
          responsive
          :options="routeStore.menus"
          :inverted="theme.header.inverted"
          @update:value="handleUpdateMenu"
        />
      </div>
    </n-scrollbar>
  </div>
</template>

<script setup>
import { useRouteStore, useThemeStore } from '@/store';
import { useRouterPush } from '@/utils';

defineOptions({ name: 'HeaderMenu' });

const route = useRoute();
const routeStore = useRouteStore();
const theme = useThemeStore();
const { routerPush } = useRouterPush();

const activeKey = computed(() => (route.meta?.activeMenu ? route.meta.activeMenu : route.name));

function handleUpdateMenu(_key, item) {
  const menuItem = item;
  routerPush(menuItem.routePath);
}
</script>

<style scoped>
:deep(.n-menu-item-content-header) {
  overflow: inherit !important;
}
:deep(.n-menu > .v-overflow) {
  justify-content: v-bind('theme.headerMenu.horizontalPosition');
}
</style>
