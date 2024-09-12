<template>
  <n-divider title-placement="center">界面功能</n-divider>
  <n-space vertical size="large">
    <setting-menu label="滚动模式">
      <n-select
        class="w-120px"
        size="small"
        :value="theme.scrollMode"
        :options="theme.scrollModeList"
        @update:value="theme.setScrollMode"
      />
    </setting-menu>
    <setting-menu label="头部高度">
      <n-input-number
        class="w-120px"
        size="small"
        :value="theme.header.height"
        :step="1"
        @update:value="theme.setHeaderHeight"
      />
    </setting-menu>
    <setting-menu label="侧边栏展开宽度">
      <n-input-number
        class="w-120px"
        size="small"
        :value="theme.sider.width"
        :step="10"
        @update:value="theme.setSiderWidth"
      />
    </setting-menu>
    <setting-menu label="自定义logo宽度">
      <n-switch :value="theme.logo.isCustomizeWidth" @update:value="theme.setIsCustomizeWidth" />
    </setting-menu>
    <setting-menu label="自定义logo宽度">
      <n-input-number
        class="w-120px"
        size="small"
        :value="theme.logo.width"
        :step="1"
        @update:value="theme.setLogoWidth"
      />
    </setting-menu>
  </n-space>
</template>

<script setup>
import { useThemeStore } from '@/store';
import SettingMenu from '../setting-menu/index.vue';

defineOptions({ name: 'PageFunc' });

const theme = useThemeStore();
</script>

<style scoped></style>
