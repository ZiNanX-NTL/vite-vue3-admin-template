import AppLoading from '@/components/common/AppLoading.vue';
import { instantiatedComponent } from '@/utils';

export function setupLoading() {
  const loading = instantiatedComponent(AppLoading).el;

  const app = document.getElementById('app');

  if (app) {
    app.innerHTML = loading?.outerHTML;
  }
}
