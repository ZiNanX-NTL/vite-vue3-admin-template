<script setup>
import { transformRouteNameToRoutePath } from '@/router';

defineOptions({ name: 'GlobalLogo' });

defineProps({
  showTitle: Boolean
});

const routeHomePath = transformRouteNameToRoutePath('root');
</script>

<template>
  <RouterLink :to="routeHomePath" class="flex-center nowrap-hidden">
    <SystemLogo class="text-32px text-primary" />
    <h2 v-show="showTitle" class="text-16px text-primary font-bold pl-8px transition-base">aptx管理系统</h2>
  </RouterLink>
</template>

<style scoped></style>
