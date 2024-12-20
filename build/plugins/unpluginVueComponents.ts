import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import IconsResolver from 'unplugin-icons/resolver';

export default (viteEnv: ImportMetaEnv) => {
	const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = viteEnv;
	/** 本地svg图标集合名称 */
	const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, '');

	return Components({
		dts: 'typings/components.d.ts',
		types: [{ from: 'vue-router', names: ['RouterLink', 'RouterView'] }],
		resolvers: [
			NaiveUiResolver(),
			IconsResolver({
				customCollections: [collectionName],
				componentPrefix: VITE_ICON_PREFIX
			})
		]
	});
};
