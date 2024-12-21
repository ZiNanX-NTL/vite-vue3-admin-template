<script setup>
import { useAppStore, useRouteStore, useThemeStore } from '@/store';

defineOptions({ name: 'GlobalContent' });

defineProps({
  showPadding: {
    type: Boolean,
    default: true
  }
});

const app = useAppStore();
const theme = useThemeStore();
const routeStore = useRouteStore();
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :name="theme.pageAnimateMode" mode="out-in" :appear="true">
      <KeepAlive :include="[...routeStore.cacheRoutes, ...routeStore.tempCacheRoutes]">
        <component
          :is="Component"
          v-if="app.reloadFlag"
          :key="route.fullPath"
          :class="{ 'p-16px': showPadding }"
          class="flex-grow transition-base"
        />
      </KeepAlive>
    </Transition>
  </RouterView>
</template>

<style scoped></style>
