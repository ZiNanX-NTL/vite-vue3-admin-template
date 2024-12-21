import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import { getSrcPath } from '../utils';

export default (viteEnv: ImportMetaEnv) => {
  const { VITE_ICON_PREFIX, VITE_ICON_LOCAL_PREFIX } = viteEnv;

  const srcPath = getSrcPath();
  const localIconPath = `${srcPath}/assets/svg-icon`;

  /** 本地svg图标集合名称 */
  const collectionName = VITE_ICON_LOCAL_PREFIX.replace(`${VITE_ICON_PREFIX}-`, '');

  return Icons({
    compiler: 'vue3',
    customCollections: {
      [collectionName]: FileSystemIconLoader(localIconPath, svg =>
        svg.replace(/^<svg\s/, '<svg width="1em" height="1em" ')
      )
    },
    scale: 1,
    defaultClass: 'inline-block'
  });
};
