<template>
  <hover-container class="w-64px h-full" tooltip-content="内容全屏" placement="bottom-end" @click="handleFullscreen">
    <icon-gridicons-fullscreen-exit v-if="app.contentFull" class="text-18px" />
    <icon-gridicons-fullscreen v-else class="text-18px" />
  </hover-container>
</template>

<script setup>
import { useAppStore } from '@/store';
const app = useAppStore();

defineOptions({ name: 'FullscreenButton' });

function handleFullscreen() {
  app.setContentFull(true);
}
</script>

<style scoped></style>
