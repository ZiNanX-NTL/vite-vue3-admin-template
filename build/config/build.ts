import type { BuildOptions } from 'vite';

export const viteBuild: BuildOptions = {
  reportCompressedSize: false,
  sourcemap: false,
  commonjsOptions: {
    ignoreTryCatch: false
  }
};
