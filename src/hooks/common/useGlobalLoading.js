import { computed } from 'vue';
import { useAppStore } from '@/store';

/** 全局加载状态 */
export default function useGlobalLoading() {
  const app = useAppStore();

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
