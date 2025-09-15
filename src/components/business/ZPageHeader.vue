<script setup lang="ts">
import { NPageHeader } from 'naive-ui';
import { h } from 'vue';

defineOptions({
  inheritAttrs: false
});

const {
  cardClass = '',
  titleCenter = false,
  showBack = true
} = defineProps<{
  showBack?: boolean;
  cardClass?: string;
  titleCenter?: boolean;
}>();

const outCardClass = computed(() => {
  return cardClass + (titleCenter ? ' title-center' : '');
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
  <NCard class="m-[-16px_-16px_0] rounded-0 w-unset shadow-sm" :class="outCardClass" :bordered="false">
    <component :is="h(NPageHeader, $attrs)" ref="pageHeaderRef" v-model="model">
      <template #back>
        <NButton v-if="showBack" text class="text-16px">
          <icon-ion-arrow-back class="text-18px mr-4px" />
          返回
        </NButton>
        <div v-else>
          <slot name="back" />
        </div>
      </template>
      <template v-for="(_value, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>
    </component>
  </NCard>
</template>

<style lang="scss" scoped>
.title-center {
  :deep(.n-page-header__main) {
    flex: 1;
    .n-page-header__title {
      margin: auto;
      transform: translateX(-35px);
    }
  }
}
</style>
