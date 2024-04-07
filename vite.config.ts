import { defineConfig, loadEnv } from 'vite';
import {
  getRootPath,
  getSrcPath,
  viteDefine,
  viteCss,
  viteServer,
  viteOptimizeDeps,
  viteBuild,
  setupVitePlugins
} from './build';

// https://vitejs.dev/config/
export default defineConfig(configEnv => {
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as unknown as ImportMetaEnv;

  const rootPath = getRootPath();
  const srcPath = getSrcPath();

  return {
    base: viteEnv.VITE_BASE_URL,
    resolve: {
      alias: {
        '~': rootPath,
        '@': srcPath
      }
    },
    define: viteDefine,
    plugins: setupVitePlugins(viteEnv),
    css: viteCss,
    server: viteServer(viteEnv),
    optimizeDeps: viteOptimizeDeps,
    build: viteBuild
  };
});
