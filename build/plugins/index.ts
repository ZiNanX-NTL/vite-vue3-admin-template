import type { PluginOption } from 'vite';
import unocss from '@unocss/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import progress from 'vite-plugin-progress';
import VueDevtools from 'vite-plugin-vue-devtools';
import autoImport from './unpluginAutoImport';
import icons from './unpluginIcons';
import components from './unpluginVueComponents';
import compression from './vitePluginCompression';
import mock from './vitePluginMock';
import svgIcons from './vitePluginSvgIcons';

export function setupVitePlugins(viteEnv: ImportMetaEnv): (PluginOption | PluginOption[])[] {
  return [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => (tag.startsWith('Tres') && tag !== 'TresCanvas') || tag === 'primitive'
        }
      }
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
