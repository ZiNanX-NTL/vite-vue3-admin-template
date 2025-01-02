<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';

const { tip } = defineProps<{
  tip: string;
}>();

const showTooltip = ref(false);
const xRef = ref(0);
const yRef = ref(0);
let inBox = false;

/** 鼠标进入 */
function handleEnter() {
  inBox = true;
}
/** 显示tooltip */
const handleShowTooltip = useDebounceFn((e: MouseEvent) => {
  if (!inBox) return;
  showTooltip.value = true;
  xRef.value = e.clientX;
  yRef.value = e.clientY;
}, 1000);
/** 隐藏tooltip */
function handleHideTooltip() {
  inBox = false;
  showTooltip.value = false;
}
</script>

<template>
  <div @mouseenter="handleEnter" @mousemove="handleShowTooltip" @mouseleave="handleHideTooltip">
    <slot></slot>
    <NTooltip :show="showTooltip" :x="xRef" :y="yRef" trigger="manual" :show-arrow="false" placement="bottom-start">
      {{ tip }}
    </NTooltip>
  </div>
</template>

<style scoped></style>
