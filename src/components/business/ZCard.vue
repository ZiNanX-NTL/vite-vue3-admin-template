<template>
  <component :is="h(NCard, $attrs)" ref="cardRef" v-model="model">
    <template #header>
      <n-h4 prefix="bar" align-text class="mb-0">{{ title }}</n-h4>
    </template>
    <template v-for="(_value, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </component>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { NCard } from 'naive-ui';

defineOptions({
  inheritAttrs: false
});

const { title } = defineProps<{
  title?: string;
}>();

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
</script>

<style lang="scss" scoped></style>
