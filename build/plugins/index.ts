import type { PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import unocss from '@unocss/vite';
import progress from 'vite-plugin-progress';
import VueDevtools from 'vite-plugin-vue-devtools';
import icons from './unpluginIcons';
import components from './unpluginVueComponents';
import autoImport from './unpluginAutoImport';
import svgIcons from './vitePluginSvgIcons';
import compression from './vitePluginCompression';
import mock from './vitePluginMock';

export function setupVitePlugins(viteEnv: ImportMetaEnv): (PluginOption | PluginOption[])[] {
	return [
		vue(),
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
