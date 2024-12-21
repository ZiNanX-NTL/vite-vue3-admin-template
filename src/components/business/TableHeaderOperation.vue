<script setup lang="ts">
defineOptions({
  name: 'TableHeaderOperation'
});

interface Props {
  itemAlign?: NaiveUI.Align;
  loading?: boolean;
}
defineProps<Props>();

interface Emits {
  (e: 'add'): void;
  (e: 'refresh'): void;
}
const emit = defineEmits<Emits>();

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
    <slot name="prefix"></slot>
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
    <slot name="suffix"></slot>
  </NSpace>
</template>

<style scoped></style>
