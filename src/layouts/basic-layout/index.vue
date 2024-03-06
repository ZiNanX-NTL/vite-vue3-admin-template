<template>
  <n-layout :has-sider="layoutProps.showSider" class="size-full" :native-scrollbar="horizontalNativeScroll">
    <global-header v-if="layoutProps.showHeader" v-bind="headerProps" />
    <global-sider v-if="layoutProps.showSider" v-bind="siderProps" :class="{ 'absolute z-300': isMobile }" />
    <n-layout
      :has-sider="layoutProps.showMixSider"
      class="size-full"
      :style="layoutStyle"
      :native-scrollbar="verticalNativeScroll"
    >
      <global-header v-if="layoutProps.showMixHeader" v-bind="headerProps" />
      <global-sider v-if="layoutProps.showMixSider" v-bind="siderProps" />
      <n-layout-content
        ref="contentRef"
        class="relative size-full"
        :class="{ 'pt-52px': theme.tab.visible && !app.contentFull }"
        :native-scrollbar="false"
        :style="layoutContentStyle"
      >
        <template v-if="theme.tab.visible && contentMounted">
          <Teleport to=".n-layout-content">
            <global-tab class="absolute top-0" :class="{ '!-top-52px': app.contentFull }"></global-tab>
          </Teleport>
        </template>
        <!-- 不需要滚动时,view外层设置h-full,继承父级100%高度,需要滚动时外层不能继承父级100%高度 -->
        <div class="w-full flex bg-#f6f9f8 dark:bg-#101014" :style="contentStyle">
          <global-content />
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
  <setting-drawer />
</template>

<script setup>
import { useFullscreen } from '@vueuse/core';
import { useAppStore, useThemeStore } from '@/store';
import { useBasicLayout } from '@/utils';
import { GlobalContent, GlobalSider, GlobalHeader, SettingDrawer, GlobalTab } from '../common';

defineOptions({ name: 'BasicLayout' });

const theme = useThemeStore();
const app = useAppStore();

const { mode, isMobile, layoutProps, headerProps, siderProps } = useBasicLayout();

const contentMounted = ref(false);
const contentRef = ref();
onMounted(() => {
  contentMounted.value = true;
  app.setContentRef(contentRef);
});

const layoutStyle = computed(() => ({
  height: mode.value === 'vertical' ? '' : `calc(100% - ${theme.header.height}px)`
}));
const layoutContentStyle = computed(() => ({
  height: mode.value === 'vertical' ? `calc(100% - ${theme.header.height}px)` : ''
}));
const contentStyle = computed(() => {
  if (app.contentFull) {
    return { minHeight: '100vh' };
  }
  return {
    minHeight: theme.tab.visible
      ? `calc(100vh - ${theme.header.height}px - 52px)`
      : `calc(100vh - ${theme.header.height}px)`
  };
});

const verticalNativeScroll = computed(() => {
  if (mode.value === 'vertical' && theme.scrollMode === 'wrapper') return false;
  return true;
});
const horizontalNativeScroll = computed(() => {
  if (mode.value === 'horizontal' && theme.scrollMode === 'wrapper') return false;
  return true;
});

watch([verticalNativeScroll, horizontalNativeScroll], async () => {
  contentMounted.value = false;
  await nextTick();
  contentMounted.value = true;
});

// 内容全屏
// const fullscreenRef = ref();
const { isFullscreen, toggle } = useFullscreen(contentRef);
watch(
  () => app.contentFull,
  newValue => {
    if (newValue && !isFullscreen.value) {
      toggle();
    }
    if (!newValue && isFullscreen.value) {
      toggle();
    }
  }
);
watch(isFullscreen, newValue => {
  if (!newValue) {
    app.setContentFull(false);
  }
});
</script>

<style lang="scss" scoped>
:deep(.n-scrollbar > .n-scrollbar-rail) {
  z-index: 100;
}
</style>
