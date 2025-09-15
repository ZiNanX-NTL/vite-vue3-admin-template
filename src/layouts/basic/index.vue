<script setup>
import { useFullscreen } from '@vueuse/core';
import { useAppStore, useThemeStore } from '@/store';
import { useBasicLayout, useIsMobile } from '@/utils';
import { GlobalContent, GlobalHeader, GlobalSider, GlobalTab, SettingDrawer } from '../common';
import { setupMixMenuContext } from '../context';

defineOptions({ name: 'BasicLayout' });

const theme = useThemeStore();
const app = useAppStore();
setupMixMenuContext();

const { mode, layoutProps, headerProps, siderProps } = useBasicLayout();
const isMobile = useIsMobile();

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
  if (mode.value === 'vertical' && theme.scrollMode === 'wrapper')
    return false;
  return true;
});
const horizontalNativeScroll = computed(() => {
  if (mode.value === 'horizontal' && theme.scrollMode === 'wrapper')
    return false;
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

<template>
  <NLayout :has-sider="layoutProps.showSider" class="size-full" :native-scrollbar="horizontalNativeScroll">
    <GlobalHeader v-if="layoutProps.showHeader" v-bind="headerProps" />
    <GlobalSider v-if="layoutProps.showSider" v-bind="siderProps" :class="{ 'absolute z-300': isMobile }" />
    <NLayout
      :has-sider="layoutProps.showMixSider"
      class="size-full"
      :style="layoutStyle"
      :native-scrollbar="verticalNativeScroll"
    >
      <GlobalHeader v-if="layoutProps.showMixHeader" v-bind="headerProps" />
      <GlobalSider v-if="layoutProps.showMixSider" v-bind="siderProps" />
      <NLayoutContent
        ref="contentRef"
        class="size-full relative"
        :class="{ 'pt-52px': theme.tab.visible && !app.contentFull }"
        :native-scrollbar="false"
        :style="layoutContentStyle"
      >
        <template v-if="theme.tab.visible && contentMounted">
          <Teleport to=".n-layout-content">
            <GlobalTab class="top-0 absolute" :class="{ '!-top-52px': app.contentFull }" />
          </Teleport>
        </template>
        <!-- 不需要滚动时,view外层设置h-full,继承父级100%高度,需要滚动时外层不能继承父级100%高度 -->
        <div class="bg-#f6f9f8 flex w-full dark:bg-#101014" :style="contentStyle">
          <GlobalContent class="w-full" />
        </div>
      </NLayoutContent>
    </NLayout>
  </NLayout>
  <SettingDrawer />
</template>

<style lang="scss" scoped>
:deep(.n-scrollbar > .n-scrollbar-rail) {
  z-index: 100;
}
</style>
