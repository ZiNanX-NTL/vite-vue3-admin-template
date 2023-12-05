<template>
  <div ref="tabRef" class="tabs-card-scroll flex nowrap-hidden">
    <div
      v-for="item in tab.tabs"
      :key="item.fullPath"
      class="select-none cursor-pointer flex flex-y-center h-32px py-6px px-16px rounded-3px mr-6px relative border-1px border-#e5e7eb dark:border-#ffffff3d hover:text-primary hover:border-[rgba(var(--primary-color),0.3)] dark:hover:border-[rgba(var(--primary-color),0.3)]"
      :class="{
        'text-primary bg-[rgba(var(--primary-color),0.1)] dark:bg-[rgba(var(--primary-color),0.15)] !border-[rgba(var(--primary-color),0.3)]':
          tab.activeTab === item.fullPath
      }"
    >
      <span>{{ item.meta.title }}</span>
      <icon-ic-round-close
        class="text-14px h-16px w-16px ml-12px rounded-50% hover:bg-#808695 hover:text-#fff dark:hover:bg-primary dark:hover:text-dark"
      />
    </div>
  </div>
</template>

<script setup>
import { useSortable } from '@vueuse/integrations/useSortable';
import { useTabStore } from '@/store';

defineOptions({ name: 'TabDetail' });

const route = useRoute();
const tab = useTabStore();

const tabRef = ref();
useSortable(tabRef, tab.tabs, {
  animation: 150
});

function init() {
  tab.iniTabStore(route);
}

watch(
  () => route.fullPath,
  () => {
    tab.addTab(route);
    tab.setActiveTab(route.fullPath);
  }
);

// 初始化
init();
</script>

<style lang="scss" scoped></style>
