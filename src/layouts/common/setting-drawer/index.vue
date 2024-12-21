<script setup>
import { useAppStore } from '@/store';
import { DarkMode, LayoutMode, PageFunc, PageView, ThemeColorSelect, ThemeConfig } from './components';

defineOptions({ name: 'SettingDrawer' });

const app = useAppStore();
</script>

<template>
  <NDrawer :show="app.settingDrawerVisible" display-directive="show" :width="330" @mask-click="app.closeSettingDrawer">
    <NDrawerContent title="主题配置" :native-scrollbar="false">
      <DarkMode />
      <LayoutMode />
      <ThemeColorSelect />
      <PageFunc />
      <PageView />
      <ThemeConfig />
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
