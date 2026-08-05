import type { PluginOption } from 'vite';
import { templateCompilerOptions } from '@tresjs/core';
import unocss from '@unocss/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import progress from 'vite-plugin-progress';
import VueDevtools from 'vite-plugin-vue-devtools';
import autoImport from './unpluginAutoImport.ts';
import icons from './unpluginIcons.ts';
import components from './unpluginVueComponents.ts';
import compression from './vitePluginCompression.ts';
import mock from './vitePluginMock.ts';
import svgIcons from './vitePluginSvgIcons.ts';

export function setupVitePlugins(viteEnv: ImportMetaEnv): (PluginOption | PluginOption[])[] {
  return [
    vue({
      ...templateCompilerOptions
    }),
    vueJsx(),
    unocss(),
    // 打包进度条
    progress(),
    VueDevtools(),
    icons(viteEnv),
    // 按需导入组件
    components(viteEnv),
    svgIcons(viteEnv),
    // 按需引入依赖
    autoImport(),
    // 压缩
    compression(viteEnv),
    mock(viteEnv)
  ];
}
