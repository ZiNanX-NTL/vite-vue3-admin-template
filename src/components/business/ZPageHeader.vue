<script setup lang="ts">
import { h } from 'vue';
import { NPageHeader } from 'naive-ui';

defineOptions({
  inheritAttrs: false
});

const model = defineModel<any>();
const pageHeaderRef = ref();

defineExpose(
  new Proxy(
    {},
    {
      get(_target, prop) {
        return pageHeaderRef.value?.[prop];
      },
      has(_target, prop) {
        return prop in pageHeaderRef.value;
      }
    }
  )
);
</script>

<template>
  <NCard class="w-unset -mx-20px -mt-20px">
    <component :is="h(NPageHeader, $attrs)" ref="pageHeaderRef" v-model="model">
      <template #back>
        <NButton text class="text-16px">
          <icon-ion-arrow-back class="mr-4px text-18px" />
          返回
        </NButton>
      </template>
      <template v-for="(_value, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}"></slot>
      </template>
    </component>
  </NCard>
</template>

<style lang="scss" scoped></style>
