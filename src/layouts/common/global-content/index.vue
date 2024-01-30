<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="theme.pageAnimateMode" mode="out-in" :appear="true">
      <keep-alive :include="routeStore.cacheRoutes">
        <component
          :is="Component"
          v-if="app.reloadFlag"
          :key="route.fullPath"
          :class="{ 'p-16px': showPadding }"
          class="flex-grow transition-base"
        />
      </keep-alive>
    </transition>
  </router-view>
</template>

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

<style scoped></style>
