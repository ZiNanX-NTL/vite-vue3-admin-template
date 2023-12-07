<template>
  <div ref="tabRef" class="tabs-card-scroll flex nowrap-hidden gap-12px">
    <div
      v-for="item in tab.tabs"
      :key="item.fullPath"
      class="select-none cursor-pointer flex flex-y-center h-32px py-4px px-12px rounded-3px relative border-1px border-#e5e7eb dark:border-#ffffff3d hover:text-primary hover:border-[rgba(var(--primary-color),0.3)] dark:hover:border-[rgba(var(--primary-color),0.3)]"
      :class="{
        'text-primary bg-[rgba(var(--primary-color),0.1)] dark:bg-[rgba(var(--primary-color),0.15)] !border-[rgba(var(--primary-color),0.3)]':
          tab.activeTab === item.fullPath
      }"
      @click="tab.handleClickTab(item.fullPath)"
      @contextmenu="handleContextMenu($event, item.fullPath, item.meta.affix)"
    >
      <svg-icon
        :icon="item.meta.icon"
        :local-icon="item.meta.localIcon"
        class="inline-block align-text-bottom text-16px mr-12px"
      />
      <span>{{ item.meta.title }}</span>
      <icon-ic-round-close
        v-if="!(item.name === tab.homeTab.name || item.meta.affix)"
        class="text-14px h-16px w-16px ml-12px rounded-50% hover:bg-#808695 hover:text-#fff dark:hover:bg-primary dark:hover:text-dark"
        @click.stop="tab.removeTab(item.fullPath)"
      />
    </div>
  </div>
  <context-menu
    :visible="dropdown.visible"
    :current-path="dropdown.currentPath"
    :affix="dropdown.affix"
    :x="dropdown.x"
    :y="dropdown.y"
    @update:visible="handleDropdownVisible"
  />
</template>

<script setup>
import { useSortable, moveArrayElement } from '@vueuse/integrations/useSortable';
import { useTabStore } from '@/store';
import { ContextMenu } from './components';

defineOptions({ name: 'TabDetail' });
const emit = defineEmits(['scroll']);

const route = useRoute();
const tab = useTabStore();

const tabRef = ref();
useSortable(tabRef, tab.tabs, {
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
</script>

<style lang="scss" scoped></style>
