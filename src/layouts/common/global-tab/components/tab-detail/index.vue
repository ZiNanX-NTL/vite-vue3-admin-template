<script setup>
import { moveArrayElement, useSortable } from '@vueuse/integrations/useSortable';
import { useTabStore } from '@/store';
import { useIsMobile } from '@/utils';
import { ContextMenu } from './components';

defineOptions({ name: 'TabDetail' });
const emit = defineEmits(['scroll']);

const route = useRoute();
const tab = useTabStore();
const isMobile = useIsMobile();

const tabRef = ref();
const { option } = useSortable(tabRef, tab.tabs, {
  animation: 150,
  onUpdate: e => {
    moveArrayElement(tab.tabs, e.oldIndex, e.newIndex);
  }
});

function init() {
  tab.iniTabStore(route);
}

// 初始化
init();

// 右键下拉菜单
const dropdown = reactive({
  visible: false,
  affix: false,
  x: 0,
  y: 0,
  currentPath: ''
});
function setDropdown(config) {
  Object.assign(dropdown, config);
}
/** 点击右键菜单 */
async function handleContextMenu(e, currentPath, affix) {
  e.preventDefault();

  const { clientX, clientY } = e;

  setDropdown({ visible: false });
  await nextTick();
  setDropdown({
    visible: true,
    x: clientX,
    y: clientY,
    currentPath,
    affix
  });
}
function handleDropdownVisible(visible) {
  setDropdown({ visible });
}

async function getActiveTabClientX() {
  await nextTick();
  if (tabRef.value && tabRef.value.children.length && tabRef.value.children[tab.activeTabIndex]) {
    const activeTabElement = tabRef.value.children[tab.activeTabIndex];
    const { x, width } = activeTabElement.getBoundingClientRect();
    const clientX = x + width / 2;
    setTimeout(() => {
      emit('scroll', clientX);
    }, 50);
  }
}

watch(
  () => route.fullPath,
  () => {
    tab.addTab(route);
    tab.setActiveTab(route.fullPath);
  }
);
watch(
  () => tab.activeTabIndex,
  () => {
    getActiveTabClientX();
  },
  {
    immediate: true
  }
);
watch(
  isMobile,
  () => {
    option('delay', isMobile.value ? 500 : 0);
  },
  {
    immediate: true
  }
);
</script>

<template>
  <div ref="tabRef" class="tabs-card-scroll flex gap-12px nowrap-hidden">
    <div
      v-for="item in tab.tabs"
      :key="item.fullPath"
      class="px-12px py-4px border-1px border-#e5e7eb rounded-3px flex flex-y-center h-32px cursor-pointer select-none relative hover:text-primary dark:border-#ffffff3d hover:border-[rgb(var(--primary-color)/0.3)] dark:hover:border-[rgb(var(--primary-color)/0.3)]"
      :class="{
        'text-primary bg-[rgb(var(--primary-color)/0.1)] dark:bg-[rgb(var(--primary-color)/0.15)] !border-[rgb(var(--primary-color)/0.3)]':
          tab.activeTab === item.fullPath
      }"
      @click="tab.handleClickTab(item.fullPath)"
      @contextmenu="handleContextMenu($event, item.fullPath, item.meta.affix)"
    >
      <SvgIcon
        :icon="item.meta.icon"
        :local-icon="item.meta.localIcon"
        class="text-16px mr-12px align-text-bottom inline-block"
      />
      <span>{{ item.meta.title }}</span>
      <icon-ic-round-close
        v-if="!(item.name === tab.homeTab.name || item.meta.affix)"
        class="text-14px ml-12px rounded-50% h-16px w-16px transition-base hover:text-#fff hover:bg-#808695 dark:hover:text-dark dark:hover:bg-primary"
        @click.stop="tab.removeTab(item.fullPath)"
      />
    </div>
  </div>
  <ContextMenu
    :visible="dropdown.visible"
    :current-path="dropdown.currentPath"
    :affix="dropdown.affix"
    :x="dropdown.x"
    :y="dropdown.y"
    @update:visible="handleDropdownVisible"
  />
</template>

<style lang="scss" scoped></style>
