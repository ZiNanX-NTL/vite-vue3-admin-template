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

<script setup>
defineOptions({
  name: 'TableHeaderOperation'
});

defineProps({
  loading: { type: Boolean },
  itemAlign: {
    validator(value) {
      return ['start', 'end', 'center', 'baseline', 'stretch', undefined].includes(value);
    },
    default: undefined
  }
});

const emit = defineEmits(['add', 'refresh']);

const columns = defineModel('columns', {
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
