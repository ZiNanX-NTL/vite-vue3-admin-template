<template>
  <n-flex align="center">
    <label :class="labelClass">{{ resultLabel }}</label>
    <n-tag :checked="isAll" checkable @click="handleCheck">全部</n-tag>
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
defineOptions({
  name: 'TagSelect'
});

interface Props {
  label?: string;
  labelClass?: string;
  options: Array<{
    value: any;
    label: string;
  }>;
}
const props = withDefaults(defineProps<Props>(), {
  label: '',
  labelClass: '',
  options: () => []
});

// 拿到options所有选项的value属性的值的类型
type OperationalKey = (typeof props.options)[number]['value'][];
const modelValue = defineModel<OperationalKey>({ required: true });

const resultLabel = computed(() => {
  return props.label ? `${props.label}：` : '';
});

// 是否选择全部
const isAll = computed(() => modelValue.value.length === 0);

function createTagOption() {
  return props.options.map(item => {
    return {
      ...item,
      checked: Boolean(modelValue.value.includes(item.value))
    };
  });
}
// 创建初始选项
const tagOptions = ref(createTagOption());

// 更新值
type tagOption = ReturnType<typeof createTagOption>[number];
function updateValue(item: tagOption) {
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
