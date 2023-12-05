<template>
  <n-layout :has-sider="layoutProps.showSider" class="wh-full" :native-scrollbar="horizontalNativeScroll">
    <global-header v-if="layoutProps.showHeader" v-bind="headerProps" />
    <global-sider v-if="layoutProps.showSider" v-bind="siderProps" />
    <n-layout
      :has-sider="layoutProps.showMixSider"
      class="wh-full"
      :style="layoutStyle"
      :native-scrollbar="verticalNativeScroll"
    >
      <global-header v-if="layoutProps.showMixHeader" v-bind="headerProps" />
      <global-sider v-if="layoutProps.showMixSider" v-bind="siderProps" />
      <n-layout-content
        class="wh-full relative"
        :class="{ 'pt-52px': theme.tab.visible }"
        :native-scrollbar="false"
        :style="layoutContentStyle"
      >
        <template v-if="theme.tab.visible && contentMounted">
          <Teleport to=".n-layout-content">
            <global-tab class="absolute top-0"></global-tab>
          </Teleport>
        </template>
        <!-- 不需要滚动时,view外层设置h-full,继承父级100%高度,需要滚动时外层不能继承父级100%高度 -->
        <div class="w-full flex">
          <global-content :style="contentStyle" />
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
  <setting-drawer />
</template>

<script setup>
import { useThemeStore } from '@/store';
import { useBasicLayout } from '@/utils';
import { GlobalContent, GlobalSider, GlobalHeader, SettingDrawer, GlobalTab } from '../common';

defineOptions({ name: 'BasicLayout' });

const theme = useThemeStore();

const { mode, layoutProps, headerProps, siderProps } = useBasicLayout();

const contentMounted = ref(false);
onMounted(() => {
  contentMounted.value = true;
});

const layoutStyle = computed(() => ({
  height: mode.value === 'vertical' ? '' : `calc(100% - ${theme.header.height}px)`
}));
const layoutContentStyle = computed(() => ({
  height: mode.value === 'vertical' ? `calc(100% - ${theme.header.height}px)` : ''
}));
const contentStyle = computed(() => ({
  minHeight: theme.tab.visible
    ? `calc(100vh - ${theme.header.height}px - 52px)`
    : `calc(100vh - ${theme.header.height}px)`
}));

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
</script>

<style lang="scss" scoped>
:deep(.n-scrollbar > .n-scrollbar-rail) {
  z-index: 100;
}
</style>
