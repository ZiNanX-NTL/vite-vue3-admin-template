<script setup>
import { useFullscreen } from '@vueuse/core';
import { useThemeStore } from '@/store';

defineOptions({ name: 'FullScreen' });

const { isFullscreen, toggle } = useFullscreen();
const theme = useThemeStore();
</script>

<template>
  <HoverContainer class="h-full w-40px" tooltip-content="全屏" :inverted="theme.header.inverted" @click="toggle">
    <icon-gridicons-fullscreen-exit v-if="isFullscreen" class="text-18px" />
    <icon-gridicons-fullscreen v-else class="text-18px" />
  </HoverContainer>
</template>

<style scoped></style>
