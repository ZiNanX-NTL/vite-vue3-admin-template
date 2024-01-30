<template>
  <n-popover placement="bottom-end" trigger="click">
    <template #trigger>
      <n-button size="small" type="primary">
        <icon-ant-design-setting-outlined class="mr-4px text-16px" />
        表格列设置
      </n-button>
    </template>
    <vue-draggable v-model="columns">
      <div v-for="item in columns" :key="item.key" class="flex-y-center h-36px px-6px hover:bg-primary_active rd-4px">
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

defineOptions({
  name: 'TableColumnSetting'
});

const columns = defineModel('columns', {
  required: true
});
</script>

<style scoped></style>
