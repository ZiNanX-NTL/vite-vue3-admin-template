<script setup lang="ts">
import { isArray } from '@/utils';

defineOptions({
  name: 'TagSelect'
});

interface Props {
  label?: string;
  labelClass?: string;
  multiple?: boolean;
  options?: any[];
  valueField?: string;
  labelField?: string;
}
const {
  label,
  labelClass,
  multiple = true,
  options = [],
  valueField = 'value',
  labelField = 'label'
} = defineProps<Props>();

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
        multiple && isArray(modelValue.value)
          ? modelValue.value.includes(item[valueField])
          : item[valueField] === modelValue.value
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
      if (!modelValue.value.includes(item[valueField])) {
        modelValue.value.push(item[valueField]);
      }
    } else {
      const index = modelValue.value.findIndex(i => i === item[valueField]);
      if (index !== -1) {
        modelValue.value.splice(index, 1);
      }
    }
  } else {
    item.checked = true;
    modelValue.value = item[valueField];
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
watch([modelValue, () => options], () => updateOptions());
</script>

<template>
  <NFlex align="center">
    <label v-if="label" :class="labelClass">{{ label }}：</label>
    <NTag v-if="multiple" :checked="isAll" checkable @click="handleCheck">全部</NTag>
    <NTag
      v-for="item in tagOptions"
      :key="item[valueField]"
      v-model:checked="item.checked"
      checkable
      @click="handleUpdateValue(item)"
    >
      {{ item[labelField] }}
    </NTag>
  </NFlex>
</template>

<style lang="scss" scoped></style>
