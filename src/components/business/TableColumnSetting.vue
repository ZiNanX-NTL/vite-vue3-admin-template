<template>
  <n-popover placement="bottom-end" trigger="click">
    <template #trigger>
      <n-button size="small" type="primary">
        <icon-ant-design-setting-outlined class="mr-4px text-16px" />
        表格列设置
      </n-button>
    </template>
    <vue-draggable v-model="columns">
      <div v-for="item in columns" :key="item.key" class="h-36px flex-y-center rd-4px px-6px hover:bg-primary_active">
        <icon-mdi-drag class="mr-8px cursor-move text-20px" />
        <NCheckbox v-model:checked="item.checked">
          {{ item.title }}
        </NCheckbox>
      </div>
    </vue-draggable>
  </n-popover>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';

defineOptions({
  name: 'TableColumnSetting'
});

const columns = defineModel<NaiveUI.TableColumnCheck[]>('columns', {
  required: true
});
</script>

<style scoped></style>
