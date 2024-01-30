<template>
  <n-space wrap justify="end" class="<sm:w-200px">
    <n-button size="small" ghost type="primary" @click="add">
      <template #icon>
        <icon-ic-round-plus class="text-icon" />
      </template>
      新增
    </n-button>
    <n-popconfirm @positive-click="batchDelete">
      <template #trigger>
        <NButton size="small" ghost type="error" :disabled="disabledDelete">
          <template #icon>
            <icon-ic-round-delete class="text-icon" />
          </template>
          批量删除
        </NButton>
      </template>
      确认删除吗？
    </n-popconfirm>
    <n-button size="small" @click="refresh">
      <template #icon>
        <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
      </template>
      刷新
    </n-button>
    <table-column-setting v-model:columns="columns" />
  </n-space>
</template>

<script setup>
defineOptions({
  name: 'TableHeaderOperation'
});

defineProps({
  disabledDelete: { type: Boolean },
  loading: { type: Boolean }
});

const emit = defineEmits(['add', 'delete', 'refresh']);

const columns = defineModel('columns', {
  default: () => []
});

function add() {
  emit('add');
}

function batchDelete() {
  emit('delete');
}

function refresh() {
  emit('refresh');
}
</script>

<style scoped></style>
