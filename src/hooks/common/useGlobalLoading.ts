import { computed } from 'vue';
import { useAppStore } from '@/store';

/** 全局加载状态 */
export default function useGlobalLoading(title = '加载中...') {
	const app = useAppStore();

	app.setLoadingTitle(title);

	const isLoading = computed(() => app.loadingVisible);

	function start() {
		app.setLoadingVisible(true);
	}

	function end() {
		app.setLoadingVisible(false);
	}

	return {
		isLoading,
		start,
		end
	};
}
