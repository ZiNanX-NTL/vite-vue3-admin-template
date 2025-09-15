<script setup lang="ts">
defineOptions({
  name: 'TableHeaderOperation'
});

defineProps<Props>();
const emit = defineEmits<Emits>();
interface Props {
  itemAlign?: NaiveUI.Align;
  loading?: boolean;
}
interface Emits {
  (e: 'add'): void;
  (e: 'refresh'): void;
}
const columns = defineModel<NaiveUI.TableColumnCheck[]>('columns', {
  default: () => []
});

function add() {
  emit('add');
}

function refresh() {
  emit('refresh');
}
</script>

<template>
  <NSpace :align="itemAlign" wrap justify="end" class="<sm:w-200px">
    <slot name="prefix" />
    <slot name="default">
      <NButton size="small" ghost type="primary" @click="add">
        <template #icon>
          <icon-ic-round-plus class="text-icon" />
        </template>
        新增
      </NButton>
    </slot>
    <NButton size="small" @click="refresh">
      <template #icon>
        <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
      </template>
      刷新
    </NButton>
    <TableColumnSetting v-model:columns="columns" />
    <slot name="suffix" />
  </NSpace>
</template>

<style scoped></style>
