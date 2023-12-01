<template>
  <dark-mode-container class="w-full h-52px pl-16px shadow-[0_1px_2px_rgba(0,21,41,0.08)]">
    <div class="h-full flex flex-y-center transition-base">
      <div
        ref="navWrap"
        class="h-full flex flex-y-center w-[calc(100%-64px)] relative"
        :class="{ 'px-32px': scrollable }"
      >
        <template v-if="scrollable">
          <icon-material-symbols-chevron-left-rounded class="tabs-arrow left-0" />
          <icon-material-symbols-chevron-right-rounded class="tabs-arrow right-0" />
        </template>
        <n-scrollbar x-scrollable>
          <div ref="navScroll" class="h-full py-10px flex-1 relative">
            <div ref="dragRef" class="tabs-card-scroll flex nowrap-hidden">
              <div
                v-for="item in list"
                :key="item.id"
                class="select-none cursor-pointer flex-none h-32px pt-6px px-16px pb-4px rounded-3px mr-6px inline-block relative bg-red hover:text-#515a6e"
              >
                <span class="float-left align-middle">{{ scrollable }}</span>
                <icon-ic-round-close
                  class="text-14px h-16px w-16px -mt-2px ml-12px rounded-50% text-#808695 hover:!text-#fff hover:bg-#808695 transition-base"
                />
              </div>
            </div>
          </div>
        </n-scrollbar>
      </div>
      <reload-button />
    </div>
  </dark-mode-container>
</template>

<script setup>
import { useSortable } from '@vueuse/integrations/useSortable';
import { useElementSize } from '@vueuse/core';
import { ReloadButton } from './components';

defineOptions({ name: 'GlobalTab' });

const dragRef = ref();
const list = ref([
  { id: 1, name: '种植情况1' },
  { id: 2, name: '种植情况2' },
  { id: 3, name: '种植情况2' },
  { id: 4, name: '种植情况2' },
  { id: 5, name: '种植情况2' },
  { id: 16, name: '种植情况2' },
  { id: 17, name: '种植情况3' }
]);

useSortable(dragRef, list, {
  animation: 150
});

const navWrap = ref();
const navScroll = ref();
const { width: navScrollWidth } = useElementSize(navScroll);
const { width: navWrapWidth } = useElementSize(navWrap);
const scrollable = computed(() => navScrollWidth.value > navWrapWidth.value);
</script>

<style lang="scss" scoped>
.tabs-arrow {
  @apply w-32px h-32px cursor-pointer absolute text-16px text-#515a6e;
}
</style>
