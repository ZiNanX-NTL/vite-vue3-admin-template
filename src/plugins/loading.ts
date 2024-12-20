import { instantiatedComponent } from '@/utils';
import AppLoading from '@/components/common/AppLoading.vue';

export function setupLoading() {
	const loading = instantiatedComponent(AppLoading).el;

	const app = document.getElementById('app');

	if (app) {
		app.innerHTML = loading?.outerHTML;
	}
}
