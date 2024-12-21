import type { App } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

/** setup vue store plugin: pinia. - [安装vue状态管理插件：pinia] */
export function setupStore(app: App) {
  const store = createPinia();
  // 使用pinia持久化插件
  store.use(piniaPluginPersistedstate);

  app.use(store);
}

export * from './modules';
export * from './subscribe';
