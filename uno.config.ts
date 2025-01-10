import { defineConfig } from '@unocss/vite';
import presetUno from '@unocss/preset-uno';
import transformerDirectives from '@unocss/transformer-directives';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import presetUnitToVw from 'unocss-preset-unit-to-vw';

export default defineConfig({
  content: {
    pipeline: {
      exclude: ['node_modules', 'dist', '.git', '.husky', '.vscode', 'public', 'build', 'mock', './stats.html']
    }
  },
  presets: [
    presetUno({ dark: 'class' }),
    presetUnitToVw({
      baseFontSize: 1,
      baseWidth: 1920,
      unitPrecision: 5,
      units: ['pw']
    })
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  shortcuts: [
    {
      'flex-center': 'flex justify-center items-center',
      'flex-x-center': 'flex justify-center',
      'flex-y-center': 'flex items-center',
      'flex-vertical': 'flex flex-col',
      'flex-vertical-center': 'flex-center flex-col',
      'flex-vertical-stretch': 'flex-vertical items-stretch',
      'i-flex-center': 'inline-flex justify-center items-center',
      'i-flex-x-center': 'inline-flex justify-center',
      'i-flex-y-center': 'inline-flex items-center',
      'i-flex-vertical': 'inline-flex flex-col',
      'i-flex-vertical-stretch': 'i-flex-vertical items-stretch',
      'flex-1-hidden': 'flex-1 overflow-hidden',
      'flex-vertical-full': 'flex-vertical-stretch overflow-hidden'
    },
    {
      'absolute-lt': 'absolute left-0 top-0',
      'absolute-lb': 'absolute left-0 bottom-0',
      'absolute-rt': 'absolute right-0 top-0',
      'absolute-rb': 'absolute right-0 bottom-0',
      'absolute-tl': 'absolute-lt',
      'absolute-tr': 'absolute-rt',
      'absolute-bl': 'absolute-lb',
      'absolute-br': 'absolute-rb',
      'absolute-center': 'absolute-lt flex-center size-full',
      'fixed-lt': 'fixed left-0 top-0',
      'fixed-lb': 'fixed left-0 bottom-0',
      'fixed-rt': 'fixed right-0 top-0',
      'fixed-rb': 'fixed right-0 bottom-0',
      'fixed-tl': 'fixed-lt',
      'fixed-tr': 'fixed-rt',
      'fixed-bl': 'fixed-lb',
      'fixed-br': 'fixed-rb',
      'fixed-center': 'fixed-lt flex-center size-full'
    },
    {
      'nowrap-hidden': 'overflow-hidden whitespace-nowrap',
      'ellipsis-text': 'nowrap-hidden text-ellipsis'
    },
    {
      'transition-base': 'transition-all duration-300 ease-in-out',
      'card-wrapper': 'rd-8px shadow-sm'
    }
  ],
  theme: {
    colors: {
      primary: 'rgb(var(--primary-color))',
      primary_hover: 'rgb(var(--primary-color-hover))',
      primary_pressed: 'rgb(var(--primary-color-pressed))',
      primary_active: 'rgb(var(--primary-color-active)/0.1)',
      primary_1: 'rgb(var(--primary-color1))',
      primary_2: 'rgb(var(--primary-color2))',
      primary_3: 'rgb(var(--primary-color3))',
      primary_4: 'rgb(var(--primary-color4))',
      primary_5: 'rgb(var(--primary-color5))',
      primary_6: 'rgb(var(--primary-color6))',
      primary_7: 'rgb(var(--primary-color7))',
      primary_8: 'rgb(var(--primary-color8))',
      primary_9: 'rgb(var(--primary-color9))',
      primary_10: 'rgb(var(--primary-color10))',
      info: 'rgb(var(--info-color))',
      info_hover: 'rgb(var(--info-color-hover))',
      info_pressed: 'rgb(var(--info-color-pressed))',
      info_active: 'rgb(var(--info-color-active)/0.1)',
      success: 'rgb(var(--success-color))',
      success_hover: 'rgb(var(--success-color-hover))',
      success_pressed: 'rgb(var(--success-color-pressed))',
      success_active: 'rgb(var(--success-color-active)/0.1)',
      warning: 'rgb(var(--warning-color))',
      warning_hover: 'rgb(var(--warning-color-hover))',
      warning_pressed: 'rgb(var(--warning-color-pressed))',
      warning_active: 'rgb(var(--warning-color-active)/0.1)',
      error: 'rgb(var(--error-color))',
      error_hover: 'rgb(var(--error-color-hover))',
      error_pressed: 'rgb(var(--error-color-pressed))',
      error_active: 'rgb(var(--error-color-active)/0.1)',
      dark: '#18181c',
      invert: '#001428'
    },
    fontSize: {
      icon: '20px'
    }
  }
});
