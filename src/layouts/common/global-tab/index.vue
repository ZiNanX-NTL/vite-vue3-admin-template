<script setup>
import { useElementBounding, useElementSize } from '@vueuse/core';
import { useThemeStore } from '@/store';
import { FullscreenButton, ReloadButton, TabDetail } from './components';

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

<template>
  <DarkModeContainer class="h-52px w-full shadow-[0_1px_2px_rgba(0,21,41,0.08)]" :class="flippable && 'pl-16px'">
    <div class="flex flex-y-center h-full transition-base">
      <div
        ref="navWrap"
        class="flex flex-y-center h-full w-[calc(100%-64px)] relative"
        :class="{ 'px-37px': flippable }"
      >
        <template v-if="flippable">
          <HoverContainer class="h-32px w-32px left-0 absolute" @click="scrollPrev">
            <icon-material-symbols-chevron-left-rounded class="text-30px" />
          </HoverContainer>
          <HoverContainer class="h-32px w-32px right-0 absolute" @click="scrollNext">
            <icon-material-symbols-chevron-right-rounded class="text-30px" />
          </HoverContainer>
        </template>
        <NScrollbar
          ref="scrollbarRef"
          x-scrollable
          :theme-overrides="scrollbarThemeOverrides"
          :class="
            isOverflow &&
            'shadow-[inset_5px_0_5px_-5px_rgba(204,204,204,0.8),inset_-5px_0_5px_-5px_rgba(204,204,204,0.8)] dark:shadow-[inset_5px_0_5px_-5px_rgba(204,204,204,0.3),inset_-5px_0_5px_-5px_rgba(204,204,204,0.3)]'
          "
        >
          <div ref="navScroll" class="px-16px py-10px flex-1 h-full relative">
            <TabDetail @scroll="handleScroll" />
          </div>
        </NScrollbar>
      </div>
      <ReloadButton />
      <FullscreenButton />
    </div>
  </DarkModeContainer>
</template>

<style lang="scss" scoped>
.tabs-arrow {
  @apply w-32px h-32px cursor-pointer absolute text-16px text-#515a6e;
}

:deep(.n-scrollbar > .n-scrollbar-container) {
  @apply overflow-y-hidden;
}
</style>
