<template>
  <slot :value="value" :props="props">
    <span v-bind="bindAttrs">{{ value }}</span>
  </slot>
</template>

<script setup>
import { TransitionPresets, useTransition } from '@vueuse/core';

defineOptions({
  name: 'CountTo'
});

const props = defineProps({
  /** 初始值 */
  startValue: {
    type: Number,
    default: 0
  },
  /** 结束值 */
  endValue: {
    type: Number,
    default: 2024
  },
  /** 动画时长 */
  duration: {
    type: Number,
    default: 1500
  },
  /** 自动动画 */
  autoplay: {
    type: Boolean,
    default: true
  },
  /** 进制 */
  decimals: {
    type: Number,
    default: 0
  },
  /** 前缀 */
  prefix: {
    type: String,
    default: ''
  },
  /** 后缀 */
  suffix: {
    type: String,
    default: ''
  },
  /** 分割符号 */
  separator: {
    type: String,
    default: ','
  },
  /** 小数点 */
  decimal: {
    type: String,
    default: '.'
  },
  /** 使用缓冲动画函数 */
  useEasing: {
    type: Boolean,
    default: true
  },
  /** 缓冲动画函数类型 */
  transition: {
    type: String,
    default: 'linear'
  }
});

const attrs = useAttrs();
const bindAttrs = computed(() => ({
  class: attrs.class || '',
  style: attrs.style || ''
}));

const source = ref(props.startValue);

const transition = computed(() => (props.useEasing ? TransitionPresets[props.transition] : undefined));

const outputValue = useTransition(source, {
  disabled: false,
  duration: props.duration,
  transition: transition.value
});

const value = computed(() => formatValue(outputValue.value));

function formatValue(num) {
  const { decimals, decimal, separator, suffix, prefix } = props;

  let number = num.toFixed(decimals);
  number = String(number);

  const x = number.split('.');
  let x1 = x[0];
  const x2 = x.length > 1 ? decimal + x[1] : '';
  const rgx = /(\d+)(\d{3})/;
  if (separator) {
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, `$1${separator}$2`);
    }
  }

  return prefix + x1 + x2 + suffix;
}

async function start() {
  await nextTick();
  source.value = props.endValue;
}

watch(
  [() => props.startValue, () => props.endValue],
  () => {
    if (props.autoplay) {
      start();
    }
  },
  { immediate: true }
);
</script>

<style scoped></style>
