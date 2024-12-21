<script setup lang="ts">
import { h } from 'vue';
import Editor from '@tinymce/tinymce-vue';
// import { fetchUploadFiles } from '@/api';
defineOptions({
  inheritAttrs: false
});
const { init = {} } = defineProps<{
  init?: any;
}>();

const model = defineModel<string>();

const apiKey = 'gc9wg4f6cb9s8zdplt0ssu2ww96fp2wr2yt4l7j88y7qpraq';
const lang = new URL('@/assets/js/langs/zh-Hans.js', import.meta.url).href;

const defaultInit = {
  language: 'zh-Hans',
  language_url: lang,
  height: '100%',
  resize: false,
  plugins:
    'preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media code codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help emoticons autosave',
  toolbar:
    'undo redo restoredraft | cut copy paste pastetext |  forecolor backcolor bold italic underline strikethrough link anchor | alignleft aligncenter alignright alignjustify outdent indent  | styles blocks fontfamily fontsize lineheight | bullist numlist | blockquote subscript superscript removeformat | table image media charmap emoticons hr pagebreak insertdatetime print preview code  | fullscreen',
  toolbar_mode: 'sliding',
  menubar: 'file edit insert view format tools table',
  font_family_formats:
    '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats;知乎配置=BlinkMacSystemFont, Helvetica Neue, PingFang SC, Microsoft YaHei, Source Han Sans SC, Noto Sans CJK SC, WenQuanYi Micro Hei, sans-serif;小米配置=Helvetica Neue,Helvetica,Arial,Microsoft Yahei,Hiragino Sans GB,Heiti SC,WenQuanYi Micro Hei,sans-serif',

  images_file_types: 'png,jpg,svg,webp',
  images_upload_handler: image_upload_handler
};
const initConfig = computed(() => ({ ...defaultInit, ...init }));

function image_upload_handler(blobInfo: any, _progress: any) {
  return new Promise((_resolve, _reject) => {
    // onUploadProgress
    const formData = new FormData();
    const file = blobInfo.blob();
    formData.append('file', file, file.name);
    // fetchUploadFiles({ file: formData.get('file') }).then(({ data, error }) => {
    //   if (!error) {
    //     resolve(data[0].filePath);
    //   } else {
    //     reject(new Error('上传失败!'));
    //   }
    // });
  });
}
</script>

<template>
  <component :is="h(Editor, $attrs)" v-model="model" :api-key="apiKey" :init="initConfig" />
</template>

<style>
.tox-tinymce-aux {
  z-index: 3000 !important;
}
.tox-statusbar__branding {
  display: none;
}
</style>
