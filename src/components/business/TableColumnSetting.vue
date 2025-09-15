<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import { isString } from '@/utils';

defineOptions({
  name: 'TableColumnSetting'
});

const columns = defineModel<NaiveUI.TableColumnCheck[]>('columns', {
  required: true
});
</script>

<template>
  <NPopover placement="bottom-end" trigger="click">
    <template #trigger>
      <NButton size="small" type="primary">
        <icon-ant-design-setting-outlined class="text-16px mr-4px" />
        表格列设置
      </NButton>
    </template>
    <VueDraggable v-model="columns">
      <div v-for="item in columns" :key="item.key" class="px-6px rd-4px flex-y-center h-36px hover:bg-primary_active">
        <icon-mdi-drag class="text-20px mr-8px cursor-move" />
        <NCheckbox v-model:checked="item.checked" class="flex-y-center">
          <template v-if="isString(item.title)">
            {{ item.title }}
          </template>
          <template v-else>
            <component :is="item.title" />
          </template>
        </NCheckbox>
      </div>
    </VueDraggable>
  </NPopover>
</template>

<style scoped></style>
