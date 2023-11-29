<template>
  <n-config-provider
    :theme="theme.naiveTheme"
    :theme-overrides="theme.naiveThemeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
    class="h-full"
  >
    <n-theme-editor style="bottom: 100px">
      <NaiveProvider>
        <router-view />
      </NaiveProvider>
    </n-theme-editor>
  </n-config-provider>
</template>

<script setup>
import { dateZhCN, zhCN } from 'naive-ui';
import { subscribeStore, useThemeStore } from '@/store';
import { useGlobalEvents } from './utils';

const theme = useThemeStore();

subscribeStore();
useGlobalEvents();
</script>

<style scoped lang="scss">
.n-config-provider {
  @apply h-full;
}
</style>
