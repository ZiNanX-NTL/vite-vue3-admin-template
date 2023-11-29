import { createApp } from 'vue';
import App from './App.vue';
import AppLoading from './components/common/AppLoading.vue';
import GlobalLoading from './components/common/GlobalLoading.vue';
import { setupAssets } from './plugins';
import { setupStore } from './store';
import { setupDirectives } from './directives';
import { setupRouter } from './router';

async function bootstrapApp() {
  // import assets: js、css
  setupAssets();

  // app loading
  const appLoading = createApp(AppLoading);

  appLoading.mount('#appLoading');

  const app = createApp(App);

  // store plugin: pinia
  setupStore(app);

  // vue custom directives
  setupDirectives(app);

  // vue router
  await setupRouter(app);

  appLoading.unmount();

  app.mount('#app');
  // }, 3000);

  createApp(GlobalLoading).mount('#globalLoading');
}

bootstrapApp();
