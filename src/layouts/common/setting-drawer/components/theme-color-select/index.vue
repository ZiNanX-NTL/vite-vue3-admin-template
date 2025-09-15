<script setup>
import { useBoolean } from '@/hooks';
import { isInTraditionColors } from '@/settings';
import { useThemeStore } from '@/store';
import { ColorCheckbox, ColorModal } from './components';

defineOptions({ name: 'ThemeColorSelect' });

const theme = useThemeStore();

const { bool: visible, setTrue: openModal, setFalse: closeModal } = useBoolean();

const isInOther = computed(() => isInTraditionColors(theme.themeColor));
const otherColorBtnType = computed(() => (isInOther.value ? 'primary' : 'default'));
</script>

<template>
  <NDivider title-placement="center">
    系统主题
  </NDivider>
  <NGrid :cols="8" :x-gap="8" :y-gap="12">
    <NGridItem v-for="color in theme.themeColorList" :key="color" class="flex-x-center">
      <ColorCheckbox :color="color" :checked="color === theme.themeColor" @click="theme.setThemeColor(color)" />
    </NGridItem>
  </NGrid>
  <NSpace :vertical="true" class="pt-12px">
    <NColorPicker :value="theme.themeColor" :show-alpha="false" @update-value="theme.setThemeColor" />
    <NButton :block="true" :type="otherColorBtnType" @click="openModal">
      更多颜色
    </NButton>
  </NSpace>
  <ColorModal :visible="visible" @close="closeModal" />
</template>

<style scoped></style>
