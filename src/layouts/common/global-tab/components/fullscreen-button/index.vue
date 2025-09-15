<script setup>
import { useAppStore } from '@/store';

defineOptions({ name: 'FullscreenButton' });

const app = useAppStore();

function handleFullscreen() {
  app.setContentFull(true);
}
</script>

<template>
  <HoverContainer class="h-full w-64px" tooltip-content="内容全屏" placement="bottom-end" @click="handleFullscreen">
    <icon-gridicons-fullscreen-exit v-if="app.contentFull" class="text-18px" />
    <icon-gridicons-fullscreen v-else class="text-18px" />
  </HoverContainer>
</template>

<style scoped></style>
