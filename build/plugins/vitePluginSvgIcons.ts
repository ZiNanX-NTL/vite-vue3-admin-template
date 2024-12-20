import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { getSrcPath } from '../utils';

export default (viteEnv: ImportMetaEnv) => {
	const { VITE_ICON_LOCAL_PREFIX } = viteEnv;
	const srcPath = getSrcPath();
	const localIconPath = `${srcPath}/assets/svg-icon`;

	return createSvgIconsPlugin({
		iconDirs: [localIconPath],
		symbolId: `${VITE_ICON_LOCAL_PREFIX}-[dir]-[name]`,
		inject: 'body-last',
		customDomId: '__SVG_ICON_LOCAL__'
	});
};
