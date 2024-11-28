import { cloneDeep } from 'lodash-es';
import { getThemeSettings, getNaiveThemeOverrides } from '@/settings';
import { merge, getColorPalette, addColorAlpha, sessionStg } from '@/utils';

/** 初始化主题配置 */
export function initThemeSettings() {
  const isProd = import.meta.env.PROD;
  // 生产环境才缓存主题配置，本地开发实时调整配置更改配置的json
  const storageSettings = sessionStg.get('themeSettings');

  if (isProd && storageSettings) {
    return storageSettings;
  }

  const themeSetting = getThemeSettings();
  const themeColor = sessionStg.get('themeColor') || themeSetting.themeColor;
  const info = themeSetting.isCustomizeInfoColor ? themeSetting.otherColor.info : getColorPalette(themeColor, 7);
  const otherColor = { ...themeSetting.otherColor, info };
  const setting = cloneDeep({ ...themeSetting, themeColor, otherColor });
  return setting;
}

/** 获取初始naive主题配置与响应主题配置结合的配置 */
export function getOverrides(state: any) {
  const initialOverrides = getNaiveThemeOverrides();
  const settingOverrides = getSettingThemeOverrides(state);
  const overrides = merge(initialOverrides, settingOverrides);
  return overrides;
}

/** 获取设置的主题配置 */
function getSettingThemeOverrides(state: any) {
  const colors = { primary: state.themeColor, ...state.otherColor };
  const { primary, success, warning, error } = colors;
  const info = state.isCustomizeInfoColor ? colors.info : getColorPalette(primary, 7, state.darkMode);

  const themeColors = getThemeColors(
    [
      ['primary', primary],
      ['info', info],
      ['success', success],
      ['warning', warning],
      ['error', error]
    ],
    state.darkMode
  );
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

type ColorType = 'primary' | 'info' | 'success' | 'warning' | 'error';
type ColorScene = '' | 'Suppl' | 'Hover' | 'Pressed' | 'Active';
type ColorKey = `${ColorType}Color${ColorScene}`;
type ThemeColor = Partial<Record<ColorKey, string>>;

interface ColorAction {
  scene: ColorScene;
  handler: (color: string) => string;
}
/** 获取主题颜色的各种场景对应的颜色 */
function getThemeColors(colors: [ColorType, string][], darkMode = false) {
  const colorActions: ColorAction[] = [
    { scene: '', handler: color => getColorPalette(color, 6, darkMode) },
    { scene: 'Suppl', handler: color => getColorPalette(color, 6, darkMode) },
    { scene: 'Hover', handler: color => getColorPalette(color, 5, darkMode) },
    { scene: 'Pressed', handler: color => getColorPalette(color, 7, darkMode) },
    { scene: 'Active', handler: color => addColorAlpha(getColorPalette(color, 6, darkMode), 0.1) }
  ];

  const themeColor: ThemeColor = {};

  colors.forEach(color => {
    colorActions.forEach(action => {
      const [colorType, colorValue] = color;
      const colorKey: ColorKey = `${colorType}Color${action.scene}`;
      themeColor[colorKey] = action.handler(colorValue);
    });
  });

  return themeColor;
}
