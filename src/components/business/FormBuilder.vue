<script setup lang="ts">
import type { FormInst } from 'naive-ui';
import type { ComponentInstance } from 'vue';
import { omit } from 'lodash-es';
import { NForm, NFormItemGi, NGridItem, NInput, NInputNumber, NSelect } from 'naive-ui';

const {
  formItems,
  rules,
  cols = '1 s:2 m:5',
  collapsed = false
} = defineProps<{
  cols?: string | number | undefined;
  collapsed?: boolean;
  formItems: Array<Record<string, any>>;
  rules: Record<string, any>;
}>();

const modelValue = defineModel<Record<string, any>>('modelValue', {
  required: true
});

const items = computed(() => {
  return formItems.filter(item => !item.hidden);
});

const componentMap = {
  input: NInput,
  number: NInputNumber,
  select: NSelect
};
function getComponent(item: any) {
  const { type }: { type: keyof typeof componentMap } = item;

  if (type && typeof type !== 'string') {
    return type; // If type is a component, return it directly
  }

  return componentMap[type] || NInput;
}

const rootProps = ['label', 'field', 'type', 'hidden', 'span', 'showFeedback'];
function getProps(item: any) {
  if (item.props)
    return item.props;
  return omit(item, rootProps);
}

const vm = getCurrentInstance();
function changeRef(ref: Element | ComponentPublicInstance | null) {
  const formInstance = ref as FormInst | null;
  vm!.exposeProxy = formInstance || {};
  vm!.exposed = formInstance || {};
}

defineExpose({} as ComponentInstance<typeof NForm>);
</script>

<template>
  <NForm :ref="changeRef" :model="modelValue" :rules="rules" label-placement="left">
    <NGrid :cols="cols" :x-gap="24" responsive="screen" item-responsive :collapsed="collapsed">
      <component
        :is="item.suffix ? NGridItem : NFormItemGi"
        v-for="item in items"
        :key="item.field"
        :label="item.label"
        :path="item.field"
        :span="item.span"
        :suffix="item.suffix"
        :show-feedback="item.showFeedback"
      >
        <template #default="slotData">
          <slot :name="item.field" v-bind="slotData || {}">
            <component
              :is="getComponent(item)"
              v-bind="getProps(item)"
              v-model:value="modelValue[item.field]"
            />
          </slot>
        </template>
      </component>
    </NGrid>
  </NForm>
</template>

<style scoped></style>
