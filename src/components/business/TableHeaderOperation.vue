<template>
  <n-space :align="itemAlign" wrap justify="end" class="<sm:w-200px">
    <slot name="prefix"></slot>
    <slot name="default">
      <n-button size="small" ghost type="primary" @click="add">
        <template #icon>
          <icon-ic-round-plus class="text-icon" />
        </template>
        新增
      </n-button>
    </slot>
    <n-button size="small" @click="refresh">
      <template #icon>
        <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
      </template>
      刷新
    </n-button>
    <table-column-setting v-model:columns="columns" />
    <slot name="suffix"></slot>
  </n-space>
</template>

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

<style scoped></style>
