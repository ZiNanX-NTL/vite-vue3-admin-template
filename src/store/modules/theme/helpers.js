import { cloneDeep } from 'lodash-es';
import { getThemeSettings, getNaiveThemeOverrides } from '@/settings';
import { merge, getColorPalette, addColorAlpha, localStg } from '@/utils';

/** 初始化主题配置 */
export function initThemeSettings() {
  const isProd = import.meta.env.PROD;
  // 生产环境才缓存主题配置，本地开发实时调整配置更改配置的json
  const storageSettings = localStg.get('themeSettings');

  if (isProd && storageSettings) {
    return storageSettings;
  }

  const themeSetting = getThemeSettings();
  const themeColor = localStg.get('themeColor') || themeSetting.themeColor;
  const info = themeSetting.isCustomizeInfoColor ? themeSetting.otherColor.info : getColorPalette(themeColor, 7);
  const otherColor = { ...themeSetting.otherColor, info };
  const setting = cloneDeep({ ...themeSetting, themeColor, otherColor });
  return setting;
}

/** 获取初始naive主题配置与响应主题配置结合的配置 */
export function getOverrides(state) {
  const initialOverrides = getNaiveThemeOverrides();
  const settingOverrides = getSettingThemeOverrides(state);
  const overrides = merge(initialOverrides, settingOverrides);
  return overrides;
}

/** 获取设置的主题配置 */
function getSettingThemeOverrides(state) {
  const colors = { primary: state.themeColor, ...state.otherColor };
  const { primary, success, warning, error } = colors;
  const info = state.isCustomizeInfoColor ? colors.info : getColorPalette(primary, 7);

  const themeColors = getThemeColors([
    ['primary', primary],
    ['info', info],
    ['success', success],
    ['warning', warning],
    ['error', error]
  ]);
  const colorLoading = primary;

  const settingOverrides = {
    common: {
      ...themeColors
    },
    LoadingBar: {
      colorLoading
    }
  };

  return settingOverrides;
}

/** 获取主题颜色的各种场景对应的颜色 */
function getThemeColors(colors) {
  const colorActions = [
    { scene: '', handler: color => color },
    { scene: 'Suppl', handler: color => color },
    { scene: 'Hover', handler: color => getColorPalette(color, 5) },
    { scene: 'Pressed', handler: color => getColorPalette(color, 7) },
    { scene: 'Active', handler: color => addColorAlpha(color, 0.1) }
  ];

  const themeColor = {};

  colors.forEach(color => {
    colorActions.forEach(action => {
      const [colorType, colorValue] = color;
      const colorKey = `${colorType}Color${action.scene}`;
      themeColor[colorKey] = action.handler(colorValue);
    });
  });

  return themeColor;
}
