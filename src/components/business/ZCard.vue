<template>
  <component :is="h(NCard, $attrs)" ref="cardRef" v-model="model">
    <template v-if="title" #header>
      <n-h4 prefix="bar" align-text class="mb-0">{{ title }}</n-h4>
    </template>
    <template #header-extra="slotData">
      <n-flex justify="end" align="center">
        <slot name="header-extra" v-bind="slotData || {}"></slot>
        <n-button v-if="showCollapse" text icon-placement="right" @click="collapse = !collapse">
          <template #icon>
            <icon-ep-arrow-up-bold
              class="text-icon transition-base transition-property-transform"
              :class="collapse ? 'rotate-180' : ''"
            />
          </template>
          折叠
        </n-button>
      </n-flex>
    </template>
    <template v-for="(_value, name) in resultSlots" #[name]="slotData">
      <slot v-if="!['default'].includes(name as string)" :name="name" v-bind="slotData || {}"></slot>
      <n-collapse-transition v-if="name === 'default'" :key="name" class="h-full" :show="!collapse" :appear="appear">
        <slot :name="name" v-bind="slotData || {}"></slot>
      </n-collapse-transition>
    </template>
  </component>
</template>

<script setup lang="ts">
import type { Slots } from 'vue';
import { h } from 'vue';
import { NCard } from 'naive-ui';

defineOptions({
  inheritAttrs: false
});

const {
  title,
  showCollapse = false,
  appear = false
} = defineProps<{
  title?: string;
  showCollapse?: boolean;
  appear?: boolean;
}>();
const collapse = defineModel<boolean>('collapse', { default: false });

const slots = useSlots();

const model = defineModel();
const cardRef = ref();

defineExpose(
  new Proxy(
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
);

/** 排除header-extra slots */
const resultSlots = computed(() => {
  const names = Object.keys(slots).filter(name => !['header-extra'].includes(name));
  const resSlots = names.reduce((acc, cur) => {
    acc[cur] = slots[cur];
    return acc;
  }, {} as any);
  return resSlots as Slots;
});
const contentPadding = computed(() => (collapse.value ? 0 : 'var(--n-padding-bottom)'));
</script>

<style lang="scss" scoped>
:deep(.n-card__content) {
  transition: padding-bottom 0.3s var(--n-bezier);
  padding-bottom: v-bind(contentPadding);
}
</style>
