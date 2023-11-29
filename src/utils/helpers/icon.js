import { h } from 'vue';
import SvgIcon from '@/components/common/SvgIcon.vue';

/**
 * 图标渲染
 * - 用于vue的render函数
 */
export const useIconRender = () => {
  /**
   * 图标渲染
   * @param config
   * @property icon - 图标名称(iconify图标的名称), 例如：mdi-account 或者 mdi:account
   * @property localIcon - 本地svg图标文件名(assets/svg-icon文件夹下)
   * @property color - 图标颜色
   * @property fontSize - 图标大小
   */
  const iconRender = config => {
    const { color, fontSize, icon, localIcon } = config;

    const style = {};

    if (color) {
      style.color = color;
    }
    if (fontSize) {
      style.fontSize = `${fontSize}px`;
    }

    if (!icon && !localIcon) {
      window.console.warn('没有传递图标名称，请确保给icon或localIcon传递有效值!');
    }

    return () => h(SvgIcon, { icon, localIcon, style });
  };

  return {
    iconRender
  };
};
