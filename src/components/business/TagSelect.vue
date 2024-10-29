<template>
  <n-flex align="center">
    <label v-if="label" :class="labelClass">{{ label }}：</label>
    <n-tag v-if="multiple" :checked="isAll" checkable @click="handleCheck">全部</n-tag>
    <n-tag
      v-for="item in tagOptions"
      :key="item.value"
      v-model:checked="item.checked"
      checkable
      @click="handleUpdateValue(item)"
    >
      {{ item.label }}
    </n-tag>
  </n-flex>
</template>

<script setup lang="ts">
import { isArray } from '@/utils';

defineOptions({
  name: 'TagSelect'
});

interface Props {
  label?: string;
  labelClass?: string;
  multiple?: boolean;
  options: Array<{
    value: any;
    label: string;
  }>;
}
const { label, labelClass, multiple = true, options = [] } = defineProps<Props>();

// 拿到options所有选项的value属性的值的类型
type OperationalKey = (typeof options)[number]['value'][];
const modelValue = defineModel<number | string | OperationalKey>({ required: true });

// 是否选择全部
const isAll = computed(() => (multiple && isArray(modelValue.value) ? modelValue.value.length === 0 : false));

function createTagOption() {
  return options.map(item => {
    return {
      ...item,
      checked: Boolean(
        multiple && isArray(modelValue.value) ? modelValue.value.includes(item.value) : item.value === modelValue.value
      )
    };
  });
}
// 创建初始选项
const tagOptions = ref(createTagOption());

// 更新值
type tagOption = ReturnType<typeof createTagOption>[number];
function updateValue(item: tagOption) {
  if (multiple && isArray(modelValue.value)) {
    if (item.checked) {
      if (!modelValue.value.includes(item.value)) {
        modelValue.value.push(item.value);
      }
    } else {
      const index = modelValue.value.findIndex(i => i === item.value);
      if (index !== -1) {
        modelValue.value.splice(index, 1);
      }
    }
  } else {
    item.checked = true;
    modelValue.value = item.value;
  }
}

// 点击全部
function handleCheck() {
  modelValue.value = [];
}

function handleUpdateValue(item: tagOption) {
  updateValue(item);
}

// 更新选择状态
function updateOptions() {
  tagOptions.value = createTagOption();
}
watch(modelValue, () => updateOptions());
</script>

<style lang="scss" scoped></style>
