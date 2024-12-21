<script setup>
import { useAppStore, useThemeStore } from '@/store';

defineOptions({ name: 'MenuCollapse' });

const app = useAppStore();
const theme = useThemeStore();
</script>

<template>
  <HoverContainer class="h-full w-40px" :inverted="theme.header.inverted" @click="app.toggleSiderCollapse">
    <icon-line-md-menu-unfold-left v-if="app.siderCollapse" class="text-16px" />
    <icon-line-md-menu-fold-left v-else class="text-16px" />
  </HoverContainer>
</template>

<style scoped></style>
