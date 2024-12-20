import AutoImport from 'unplugin-auto-import/vite';

export default () => {
	return AutoImport({
		dts: 'typings/auto-imports.d.ts',
		imports: ['vue', 'vue-router']
	});
};
