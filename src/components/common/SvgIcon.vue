<script setup>
import { Icon } from '@iconify/vue';

defineOptions({ name: 'SvgIcon' });

/**
 * 图标组件
 *
 * - 支持iconify和本地svg图标
 * - 同时传递了icon和localIcon，localIcon会优先渲染
 */

const props = defineProps({
  icon: {
    type: String,
    default: ''
  },
  localIcon: {
    type: String,
    default: ''
  }
});

const attrs = useAttrs();

const bindAttrs = computed(() => ({
  class: attrs.class || '',
  style: attrs.style || ''
}));

const symbolId = computed(() => {
  const { VITE_ICON_LOCAL_PREFIX: preffix } = import.meta.env;

  const defaultLocalIcon = 'no-icon';

  const icon = props.localIcon || defaultLocalIcon;

  return `#${preffix}-${icon}`;
});

/** 渲染本地icon */
const renderLocalIcon = computed(() => props.localIcon || !props.icon);
</script>

<template>
  <template v-if="renderLocalIcon">
    <svg aria-hidden="true" width="1em" height="1em" v-bind="bindAttrs">
      <use :xlink:href="symbolId" fill="currentColor" />
    </svg>
  </template>
  <template v-else>
    <Icon v-if="icon" :icon="icon" v-bind="bindAttrs" />
  </template>
</template>

<style scoped></style>
