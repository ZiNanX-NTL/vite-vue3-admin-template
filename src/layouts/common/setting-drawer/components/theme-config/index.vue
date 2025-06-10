<script setup>
import Clipboard from 'clipboard';
import { useThemeStore } from '@/store';

defineOptions({ name: 'ThemeConfig' });

const theme = useThemeStore();

const copyRef = ref();

const dataClipboardText = ref(getClipboardText());

function getClipboardText() {
  return JSON.stringify(theme.$state);
}

function clipboardEventListener() {
  if (!copyRef.value) return;
  const copy = new Clipboard(copyRef.value);
  copy.on('success', () => {
    window.$dialog?.success({
      title: '操作成功',
      content: '复制成功,请替换 src/settings/theme.json的内容！',
      positiveText: '确认'
    });
  });
}

const stopHandle = watch(
  () => theme.$state,
  () => {
    dataClipboardText.value = getClipboardText();
  },
  { deep: true }
);

onMounted(() => {
  clipboardEventListener();
});
onUnmounted(() => {
  stopHandle();
});
</script>

<template>
  <NDivider title-placement="center">主题配置</NDivider>
  <textarea id="themeConfigCopyTarget" v-model="dataClipboardText" class="opacity-0 absolute" />
  <NSpace vertical>
    <div ref="copyRef" data-clipboard-target="#themeConfigCopyTarget">
      <NButton type="primary" :block="true">拷贝当前配置</NButton>
    </div>
  </NSpace>
</template>

<style scoped></style>
