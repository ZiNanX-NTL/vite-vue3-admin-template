<script setup>
import { useAppStore, useThemeStore } from '@/store';

defineOptions({ name: 'SettingButton' });

const app = useAppStore();
const theme = useThemeStore();
</script>

<template>
  <HoverContainer
    class="h-full w-40px"
    tooltip-content="主题配置"
    :inverted="theme.header.inverted"
    @click="app.toggleSettingDrawerVisible"
  >
    <icon-ant-design-setting-outlined class="text-20px" />
  </HoverContainer>
</template>

<style scoped></style>
