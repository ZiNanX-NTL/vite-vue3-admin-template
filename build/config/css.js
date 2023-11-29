export const viteCss = {
  preprocessorOptions: {
    scss: {
      additionalData: `@use "./src/styles/scss/global.scss" as *;`
    }
  }
};
