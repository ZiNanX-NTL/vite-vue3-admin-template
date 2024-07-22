import theme from './theme.json';
import jsonNaiveTheme from './naive-ui-theme-overrides.json';
import colorJson from './color.json';

interface TraditionColorDetail {
  label: string;
  color: string;
}
interface TraditionColor {
  label: string;
  data: TraditionColorDetail[];
}

/**
 * js 文件下使用这个做类型提示
 * @type import('naive-ui').GlobalThemeOverrides
 */
const defaultNaiveTheme = {};

export function getThemeSettings() {
  return theme;
}

export function getNaiveThemeOverrides() {
  return jsonNaiveTheme || defaultNaiveTheme;
}

/** 中国传统颜色 */
export const traditionColors = colorJson as TraditionColor[];

export function isInTraditionColors(color: string) {
  return traditionColors.some(item => {
    const flag = item.data.some(v => v.color === color);
    return flag;
  });
}
