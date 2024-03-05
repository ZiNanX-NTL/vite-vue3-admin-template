<template>
  <div class="absolute-lt z-1 wh-full overflow-hidden">
    <div class="absolute -right-300px -top-900px <sm:(-right-100px -top-1170px)">
      <corner-top :start-color="lightColor" :end-color="darkColor" />
    </div>
    <div class="absolute -bottom-400px -left-200px <sm:(-bottom-760px -left-100px)">
      <corner-bottom :start-color="darkColor" :end-color="lightColor" />
    </div>
  </div>
</template>

<script setup>
import { getColorPalette } from '@/utils';
import { CornerBottom, CornerTop } from './components';

const props = defineProps({
  /** 主题颜色 */
  themeColor: {
    type: String,
    required: true
  }
});

const lightColor = computed(() => getColorPalette(props.themeColor, 3));
const darkColor = computed(() => getColorPalette(props.themeColor, 6));
</script>

<style scoped></style>
