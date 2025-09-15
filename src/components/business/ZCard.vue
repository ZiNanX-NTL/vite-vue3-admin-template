<script setup lang="ts">
import type { ComponentInstance, Slots } from 'vue';
import { NCard } from 'naive-ui';
import { h } from 'vue';

defineOptions({
  inheritAttrs: false
});

const {
  title,
  showPrefix = true,
  showCollapse = false,
  appear = false,
  titleClass = ''
} = defineProps<{
  title?: string;
  showPrefix?: boolean;
  showCollapse?: boolean;
  appear?: boolean;
  titleClass?: string;
}>();
const collapse = defineModel<boolean>('collapse', { default: false });

const slots = useSlots();

const model = defineModel<any>();

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

const vm = getCurrentInstance();
function changeRef(ref: Element | ComponentPublicInstance | null) {
  const formInstance = ref;
  vm!.exposeProxy = formInstance || {};
  vm!.exposed = formInstance || {};
}

defineExpose({} as ComponentInstance<typeof NCard>);
</script>

<template>
  <component :is="h(NCard, { ...$attrs, ref: changeRef })" v-model="model">
    <template v-if="title" #header>
      <NFlex align="center">
        <NH4 :prefix="showPrefix ? 'bar' : undefined" align-text class="mb-0" :class="titleClass">
          {{ title }}
        </NH4>
        <slot name="tip" />
      </NFlex>
    </template>
    <template #header-extra="slotData">
      <NFlex justify="end" align="center">
        <slot name="header-extra" v-bind="slotData || {}" />
        <NButton v-if="showCollapse" text icon-placement="right" @click="collapse = !collapse">
          <template #icon>
            <icon-ep-arrow-up-bold
              class="text-icon transition-base transition-property-transform"
              :class="collapse ? 'rotate-180' : ''"
            />
          </template>
        </NButton>
      </NFlex>
    </template>
    <template v-for="(_value, name) in resultSlots" #[name]="slotData">
      <slot v-if="!['default'].includes(name as string)" :name="name" v-bind="slotData || {}" />
      <NCollapseTransition v-if="name === 'default'" :key="name" class="h-full" :show="!collapse" :appear="appear">
        <slot :name="name" v-bind="slotData || {}" />
      </NCollapseTransition>
    </template>
  </component>
</template>

<style lang="scss" scoped>
:deep(.n-card__content) {
  transition: padding-bottom 0.3s var(--n-bezier);
  padding-bottom: v-bind(contentPadding);
}
</style>
