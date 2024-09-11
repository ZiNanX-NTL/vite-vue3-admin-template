import { createApp } from 'vue';
import App from './App.vue';
import GlobalLoading from './components/common/GlobalLoading.vue';
import { setupAssets, setupDayjs, setupLoading } from './plugins';
import { setupStore } from './store';
import { setupDirectives } from './directives';
import { setupRouter } from './router';

async function bootstrapApp() {
  // import assets: js、css
  setupAssets();

  // app loading
  setupLoading();

  setupDayjs();

  const app = createApp(App);

  // store plugin: pinia
  setupStore(app);

  // vue custom directives
  setupDirectives(app);

  // vue router
  await setupRouter(app);

  app.mount('#app');

  createApp(GlobalLoading).mount('#globalLoading');
}

bootstrapApp();
