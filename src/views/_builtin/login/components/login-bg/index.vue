<script setup lang="ts">
import { getColorPalette } from '@/utils';
import { CornerBottom, CornerTop } from './components';

const { themeColor } = defineProps<{
  /** 主题颜色 */
  themeColor: string;
}>();

const lightColor = computed(() => getColorPalette(themeColor, 3));
const darkColor = computed(() => getColorPalette(themeColor, 6));
</script>

<template>
  <div class="absolute-lt z-1 size-full overflow-hidden">
    <div class="absolute -right-300px -top-900px <sm:(-right-100px -top-1170px)">
      <CornerTop :start-color="lightColor" :end-color="darkColor" />
    </div>
    <div class="absolute -bottom-400px -left-200px <sm:(-bottom-760px -left-100px)">
      <CornerBottom :start-color="darkColor" :end-color="lightColor" />
    </div>
  </div>
</template>

<style scoped></style>
