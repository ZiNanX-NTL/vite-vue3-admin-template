<template>
  <n-popover placement="bottom-end" trigger="click">
    <template #trigger>
      <n-button size="small" type="primary">
        <icon-ant-design-setting-outlined class="mr-4px text-16px" />
        表格列设置
      </n-button>
    </template>
    <vue-draggable v-model="list">
      <div v-for="item in list" :key="item.key" class="flex-y-center h-36px px-6px hover:bg-primary_active rd-4px">
        <icon-mdi-drag class="mr-8px text-20px cursor-move" />
        <NCheckbox v-model:checked="item.checked">
          {{ item.title }}
        </NCheckbox>
      </div>
    </vue-draggable>
  </n-popover>
</template>

<script setup>
import { VueDraggable } from 'vue-draggable-plus';

const props = defineProps({
  columns: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:columns']);

const list = ref(initList());

function initList() {
  return props.columns.map(item => ({ ...item, checked: true }));
}

watch(
  list,
  newValue => {
    const newColumns = newValue.filter(item => item.checked);

    const columns = newColumns.map(item => {
      const column = { ...item };
      delete column.checked;

      return column;
    });

    emit('update:columns', columns);
  },
  { deep: true }
);
</script>

<style scoped></style>
