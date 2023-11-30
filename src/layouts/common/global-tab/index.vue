<template>
  <dark-mode-container class="w-full h-44px shadow-[0_1px_2px_rgba(0,21,41,0.08)]">
    <div class="h-full flex flex-y-center transition-base">
      <div class="h-full py-6px flex flex-y-center w-full">
        <div ref="navWrap" class="h-full flex-1 overflow-hidden relative">
          <icon-material-symbols-chevron-left-rounded class="tabs-arrow left-0" />
          <icon-material-symbols-chevron-right-rounded class="tabs-arrow right-0" />
          <div ref="navScroll" class="tabs-card-scroll flex nowrap-hidden">
            <div
              v-for="item in list"
              :key="item.id"
              class="select-none cursor-pointer h-32px pt-6px px-16px pb-4px rounded-3px mr-6px inline-block relative bg-red hover:text-#515a6e"
              @click="handleClick"
            >
              <span class="float-left align-middle">{{ item.name }}</span>
              <icon-ic-round-close
                class="text-14px h-16px w-16px -mt-2px ml-12px rounded-50% text-#808695 hover:!text-#fff hover:bg-#808695 transition-base"
              />
            </div>
          </div>
        </div>
      </div>
      <reload-button />
    </div>
  </dark-mode-container>
</template>

<script setup>
import { useSortable } from '@vueuse/integrations/useSortable';
import { useAppStore } from '@/store';
import { ReloadButton } from './components';

defineOptions({ name: 'GlobalTab' });

const navScroll = ref();
const list = ref([
  { id: 1, name: '种植情况1' },
  { id: 2, name: '种植情况2' },
  { id: 3, name: '种植情况3' }
]);

useSortable(navScroll, list, {
  animation: 150
});

const app = useAppStore();
function handleClick() {
  console.log(app.reloadFlag);
}
</script>

<style lang="scss" scoped>
.tabs-arrow {
  @apply w-32px h-32px cursor-pointer absolute text-16px text-#515a6e;
}
</style>
