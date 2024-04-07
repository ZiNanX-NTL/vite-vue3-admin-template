import type { ServerOptions } from 'vite';

export function viteServer(viteEnv: ImportMetaEnv): ServerOptions {
  return {
    host: '0.0.0.0',
    port: 3200,
    open: true,
    proxy: {
      [viteEnv.VITE_PROXY_PATTERN]: {
        target: viteEnv.VITE_REQUEST_URL,
        changeOrigin: true,
        rewrite: path => path.replace(new RegExp(`^${viteEnv.VITE_PROXY_PATTERN}`), '')
      }
    }
  };
}
