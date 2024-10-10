import type { CSSOptions } from 'vite';

export const viteCss: CSSOptions = {
  preprocessorOptions: {
    scss: {
      api: 'modern-compiler',
      additionalData: `@use "@/styles/scss/global.scss" as *;`
    }
  }
};
