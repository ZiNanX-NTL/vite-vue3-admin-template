<script setup>
import { useTabStore } from '@/store';
import { useIconRender } from '@/utils';

defineOptions({ name: 'ContextMenu' });

const props = defineProps({
  /** 右键菜单可见性 */
  visible: {
    type: Boolean,
    default: false
  },
  /** 当前路由路径 */
  currentPath: {
    type: String,
    default: ''
  },
  /** 是否固定在tab卡不可关闭 */
  // affix: Boolean,
  /** 鼠标x坐标 */
  x: {
    type: Number,
    required: true
  },
  /** 鼠标y坐标 */
  y: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:visible']);

const tab = useTabStore();
const { iconRender } = useIconRender();

const dropdownVisible = computed({
  get() {
    return props.visible;
  },
  set(visible) {
    emit('update:visible', visible);
  }
});

function hide() {
  dropdownVisible.value = false;
}

const options = computed(() => [
  {
    label: '关闭其他',
    key: 'close-other',
    icon: iconRender({ icon: 'ant-design:column-width-outlined' })
  },
  {
    label: '关闭左侧',
    key: 'close-left',
    icon: iconRender({ icon: 'mdi:format-horizontal-align-left' })
  },
  {
    label: '关闭右侧',
    key: 'close-right',
    icon: iconRender({ icon: 'mdi:format-horizontal-align-right' })
  },
  {
    label: '关闭所有',
    key: 'close-all',
    icon: iconRender({ icon: 'ant-design:line-outlined' })
  }
]);

const actionMap = new Map([
  [
    'close-other',
    () => {
      tab.clearTab([props.currentPath]);
    }
  ],
  [
    'close-left',
    () => {
      tab.clearLeftTab(props.currentPath);
    }
  ],
  [
    'close-right',
    () => {
      tab.clearRightTab(props.currentPath);
    }
  ],
  [
    'close-all',
    () => {
      tab.clearAllTab();
    }
  ]
]);

function handleDropdown(optionKey) {
  const key = optionKey;
  const actionFunc = actionMap.get(key);
  if (actionFunc) {
    actionFunc();
  }
  hide();
}
</script>

<template>
  <NDropdown
    :show="dropdownVisible"
    :options="options"
    placement="bottom-start"
    :x="x"
    :y="y"
    @clickoutside="hide"
    @select="handleDropdown"
  />
</template>

<style scoped></style>
