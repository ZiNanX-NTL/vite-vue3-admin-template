<template>
  <component :is="h(ZCard, $attrs)" ref="cardRef" v-model="model" class="card-wrapper" content-class="h-0 flex-1">
    <template #header-extra="slotData">
      <slot name="header-extra" v-bind="slotData || {}">
        <n-flex align="center">
          <n-button size="small" @click="refresh">
            <template #icon>
              <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
            </template>
            刷新
          </n-button>
        </n-flex>
      </slot>
    </template>
    <template v-for="(_value, name) in resultSlots" #[name]="slotData">
      <slot v-if="!['default'].includes(name as string)" :name="name" v-bind="slotData || {}"></slot>
      <n-spin v-if="name === 'default'" :key="name" :show="loading" class="h-full" content-class="h-full">
        <n-scrollbar id="image-scroll-container" class="h-full">
          <slot :name="name" v-bind="{ ...slotData, list: listData }"></slot>
        </n-scrollbar>
        <n-empty v-if="!listData.length && !loading" class="size-full flex-center" description="暂无数据"></n-empty>
      </n-spin>
    </template>
    <template #footer="slotData">
      <n-flex justify="end">
        <slot name="footer" v-bind="slotData || {}">
          <n-pagination v-if="pagination" v-bind="pagination" :disabled="loading" />
        </slot>
      </n-flex>
    </template>
  </component>
</template>

<script setup lang="ts">
import { h } from 'vue';
import type { Slots } from 'vue';
import type { PaginationProps } from 'naive-ui';
import ZCard from './ZCard.vue';

defineOptions({
  inheritAttrs: false
});

const {
  loading = false,
  listData = [],
  pagination
} = defineProps<{
  /** 加载状态 */
  loading?: boolean;
  /** 列表数据 */
  listData?: any[];
  /** 分页参数 */
  pagination?: PaginationProps;
}>();
const emit = defineEmits(['refresh']);

const model = defineModel();
const cardRef = ref();
const slots = useSlots();

/** 排除header-extra slots */
const resultSlots = computed(() => {
  const names = Object.keys(slots).filter(name => !['header-extra', 'footer'].includes(name));
  const resSlots = names.reduce((acc, cur) => {
    acc[cur] = slots[cur];
    return acc;
  }, {} as any);
  return resSlots as Slots;
});

/** 刷新 */
function refresh() {
  emit('refresh');
}

defineExpose({
  ...new Proxy(
    {},
    {
      get(_target, prop) {
        return cardRef.value?.[prop];
      },
      has(_target, prop) {
        return prop in cardRef.value;
      }
    }
  )
});
</script>

<style lang="scss" scoped></style>
