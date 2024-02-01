<template>
  <dark-mode-container class="w-full h-52px pl-16px shadow-[0_1px_2px_rgba(0,21,41,0.08)]">
    <div class="h-full flex flex-y-center transition-base">
      <div
        ref="navWrap"
        class="h-full flex flex-y-center w-[calc(100%-64px)] relative"
        :class="{ 'px-37px': flippable }"
      >
        <template v-if="flippable">
          <hover-container class="w-32px h-32px absolute left-0" @click="scrollPrev">
            <icon-material-symbols-chevron-left-rounded class="text-30px" />
          </hover-container>
          <hover-container class="w-32px h-32px absolute right-0" @click="scrollNext">
            <icon-material-symbols-chevron-right-rounded class="text-30px" />
          </hover-container>
        </template>
        <n-scrollbar ref="scrollbarRef" x-scrollable :theme-overrides="scrollbarThemeOverrides">
          <div ref="navScroll" class="h-full py-10px flex-1 relative">
            <TabDetail @scroll="handleScroll" />
          </div>
        </n-scrollbar>
      </div>
      <reload-button />
      <fullscreen-button />
    </div>
  </dark-mode-container>
</template>

<script setup>
import { useElementBounding, useElementSize } from '@vueuse/core';
import { useThemeStore } from '@/store';
import { ReloadButton, FullscreenButton, TabDetail } from './components';

defineOptions({ name: 'GlobalTab' });

const theme = useThemeStore();
const scrollbarThemeOverrides = computed(() => ({
  common: {
    scrollbarHeight: theme.tab.scrollMode === 'button' ? '0' : '5px'
  }
}));

const navWrap = ref();
const navScroll = ref();
const { width: navScrollWidth } = useElementSize(navScroll);
const { width: navWrapWidth } = useElementSize(navWrap);
const isOverflow = computed(() => navScrollWidth.value > navWrapWidth.value);
const flippable = computed(() => theme.tab.scrollMode === 'button' && navScrollWidth.value > navWrapWidth.value);

// 翻页滚动
const scrollbarRef = ref();
function scrollPrev() {
  scrollbarRef.value.scrollBy({ left: -navWrapWidth.value, behavior: 'smooth' });
}
function scrollNext() {
  scrollbarRef.value.scrollBy({ left: navWrapWidth.value, behavior: 'smooth' });
}
// 点击标签页滚动
const { left: navWrapLeft } = useElementBounding(navWrap);
function handleScroll(clientX) {
  if (!isOverflow) return;
  const currentX = clientX - navWrapLeft.value;
  const deltaX = currentX - navWrapWidth.value / 2;
  scrollbarRef.value.scrollBy({ left: deltaX, behavior: 'smooth' });
}
</script>

<style lang="scss" scoped>
.tabs-arrow {
  @apply w-32px h-32px cursor-pointer absolute text-16px text-#515a6e;
}

:deep(.n-scrollbar > .n-scrollbar-container) {
  @apply overflow-y-hidden;
}
</style>
