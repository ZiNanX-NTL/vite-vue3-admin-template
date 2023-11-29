<template>
  <n-drawer :show="app.settingDrawerVisible" display-directive="show" :width="330" @mask-click="app.closeSettingDrawer">
    <n-drawer-content title="主题配置" :native-scrollbar="false">
      <dark-mode />
      <layout-mode />
      <theme-color-select />
      <page-func />
      <page-view />
      <theme-config />
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { useAppStore } from '@/store';
import { DarkMode, LayoutMode, ThemeColorSelect, PageFunc, PageView, ThemeConfig } from './components';

defineOptions({ name: 'SettingDrawer' });

const app = useAppStore();
</script>

<style scoped></style>
