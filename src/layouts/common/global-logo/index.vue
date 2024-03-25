<template>
  <router-link :to="routeHomePath" class="w-full flex-center nowrap-hidden">
    <system-logo class="text-32px text-primary" />
    <h2 v-show="showTitle" class="pl-8px text-16px text-primary font-bold transition-base">aptx管理系统</h2>
  </router-link>
</template>

<script setup>
import { transformRouteNameToRoutePath } from '@/router';

defineOptions({ name: 'GlobalLogo' });

defineProps({
  showTitle: Boolean
});

const routeHomePath = transformRouteNameToRoutePath('root');
</script>

<style scoped></style>
