import type { CSSOptions } from 'vite';

export const viteCss: CSSOptions = {
  preprocessorOptions: {
    scss: {
      additionalData: `@use "@/styles/scss/global.scss" as *;`
    }
  }
};
