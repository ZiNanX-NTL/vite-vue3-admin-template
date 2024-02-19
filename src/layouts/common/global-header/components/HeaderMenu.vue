<template>
  <div class="flex-1-hidden h-full px-10px">
    <n-scrollbar :x-scrollable="true" class="flex-1-hidden h-full" content-class="h-full">
      <div class="flex-y-center h-full">
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
