import { effectScope, onScopeDispose, watch } from 'vue';
import type { GlobalThemeOverrides } from 'naive-ui';
import { useOsTheme } from 'naive-ui';
import { kebabCase } from 'lodash-es';
import { sessionStg, getColorPalettes, getRgbOfColor } from '@/utils';
import { useThemeStore } from '../modules';

/** 订阅theme store */
export default function subscribeThemeStore() {
  const theme = useThemeStore();
  const { addDarkClass, removeDarkClass } = handleCssDarkMode();
  const scope = effectScope();

  scope.run(() => {
    // 监听主题颜色
    watch(
      () => theme.themeColor,
      newValue => {
        sessionStg.set('themeColor', newValue);
      },
      { immediate: true }
    );

    // 监听naiveUI themeOverrides
    watch(
      () => theme.naiveThemeOverrides,
      newValue => {
        if (newValue.common) {
          addThemeCssVarsToHtml(newValue.common, theme.darkMode);
        }
      },
      { immediate: true }
    );

    // 监听暗黑模式
    watch(
      () => theme.darkMode,
      newValue => {
        if (newValue) {
          addDarkClass();
        } else {
          removeDarkClass();
        }
        addThemeCssVarsToHtml(theme.naiveThemeOverrides.common, newValue);
      },
      {
        immediate: true
      }
    );

    // 监听操作系统主题模式
    watch(
      useOsTheme,
      mode => {
        const isDark = mode.value === 'dark';
        theme.setAutoFollowSystemMode(isDark);
      },
      { immediate: true }
    );
  });

  onScopeDispose(() => {
    scope.stop();
  });
}

/** css 暗黑模式 */
function handleCssDarkMode() {
  const DARK_CLASS = 'dark';
  function addDarkClass() {
    document.documentElement.classList.add(DARK_CLASS);
  }
  function removeDarkClass() {
    document.documentElement.classList.remove(DARK_CLASS);
  }
  return {
    addDarkClass,
    removeDarkClass
  };
}

type ThemeVars = Exclude<GlobalThemeOverrides['common'], undefined>;
type ThemeVarsKeys = keyof ThemeVars;

/** 添加css vars至html */
function addThemeCssVarsToHtml(themeVars: ThemeVars, isDark = false) {
  const keys = Object.keys(themeVars) as ThemeVarsKeys[];
  const style: string[] = [];
  keys.forEach(key => {
    const styleValue = themeVars[key];

    if (styleValue) {
      const { r, g, b } = getRgbOfColor(styleValue, isDark);
      style.push(`--${kebabCase(key)}: ${r} ${g} ${b}`);

      if (key === 'primaryColor') {
        const colorPalettes = getColorPalettes(styleValue, isDark);

        colorPalettes.forEach((palette, index) => {
          const { r: pR, g: pG, b: pB } = getRgbOfColor(palette);
          style.push(`--${kebabCase(key)}${index + 1}: ${pR} ${pG} ${pB}`);
        });
      }
    }
  });
  const styleStr = style.join(';');
  document.documentElement.style.cssText += styleStr;
}
