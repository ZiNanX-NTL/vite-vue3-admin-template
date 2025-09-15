import type { App, Directive } from 'vue';

export default function setupNetworkDirective(app: App) {
  function listenerHandler(event: MouseEvent) {
    const hasNetwork = window.navigator.onLine;
    if (!hasNetwork) {
      window.$message?.error('网络不可用~');
      event.stopPropagation();
    }
  }

  const networkDirective: Directive<HTMLElement, boolean | undefined> = {
    mounted(el, binding) {
      if (binding.value === false)
        return;
      el.addEventListener('click', listenerHandler, { capture: true });
    },
    unmounted(el, binding) {
      if (binding.value === false)
        return;
      el.removeEventListener('click', listenerHandler);
    }
  };

  app.directive('network', networkDirective);
}
