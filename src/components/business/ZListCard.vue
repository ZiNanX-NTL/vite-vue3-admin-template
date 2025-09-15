<script setup lang="ts">
import type { PaginationProps } from 'naive-ui';
import type { Slots } from 'vue';
import { h } from 'vue';
import ZCard from './ZCard.vue';

defineOptions({
  inheritAttrs: false
});

const {
  loading = false,
  listData = [],
  pagination,
  contentClass = ''
} = defineProps<{
  /** 加载状态 */
  loading?: boolean;
  /** 列表数据 */
  listData?: any[];
  /** 分页参数 */
  pagination?: PaginationProps;
  /** 内容区样式类 */
  contentClass?: string;
}>();
const emit = defineEmits<{
  refresh: [];
}>();

const model = defineModel<any>();
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

<template>
  <component :is="h(ZCard, $attrs)" ref="cardRef" v-model="model" :content-class="`!p-0 h-0 flex-1 ${contentClass}`">
    <template #header-extra="slotData">
      <slot name="header-extra" v-bind="slotData || {}">
        <NFlex align="center">
          <NButton size="small" @click="refresh">
            <template #icon>
              <icon-mdi-refresh class="text-icon" :class="{ 'animate-spin': loading }" />
            </template>
            刷新
          </NButton>
        </NFlex>
      </slot>
    </template>
    <template v-for="(_value, name) in resultSlots" #[name]="slotData">
      <slot v-if="!['default'].includes(name as string)" :name="name" v-bind="slotData || {}" />
      <NSpin v-if="name === 'default'" :key="name" :show="loading" class="h-full" content-class="h-full relative">
        <NScrollbar id="image-scroll-container" class="h-full">
          <slot :name="name" v-bind="{ ...slotData, list: listData }" />
        </NScrollbar>
        <NEmpty
          v-if="!listData.length && !loading"
          class="flex-center size-full absolute-lt"
          description="暂无数据"
        />
      </NSpin>
    </template>
    <template #footer="slotData">
      <NFlex justify="end">
        <slot name="footer" v-bind="slotData || {}">
          <NPagination v-if="pagination" v-bind="pagination" :disabled="loading" />
        </slot>
      </NFlex>
    </template>
  </component>
</template>

<style lang="scss" scoped></style>
