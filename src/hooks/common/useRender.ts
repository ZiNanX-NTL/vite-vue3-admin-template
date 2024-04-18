import { useElementSize } from '@vueuse/core';

interface renderCallbacks<T> {
  render?: () => T | Promise<T>;
  resize?: (instance?: T) => void | Promise<void>;
  destroy?: (instance?: T) => void | Promise<void>;
}

export default function useRender<T>(domRef: Ref<HTMLElement | null>, callbacks: renderCallbacks<T> = {}) {
  const scope = effectScope();

  const initialSize = { width: 0, height: 0 };
  const { width, height } = useElementSize(domRef, initialSize);

  const instance = shallowRef<T | null>(null);

  const { render, resize = () => {}, destroy = () => {} } = callbacks;

  /**
   * whether can render
   *
   * when domRef is ready and initialSize is valid
   */
  function canRender() {
    return domRef.value && initialSize.width > 0 && initialSize.height > 0;
  }

  /** is chart rendered */
  function isRendered() {
    return Boolean(domRef.value && instance.value);
  }

  /**
   * render by size
   *
   * @param w width
   * @param h height
   */
  async function renderBySize(w: number, h: number) {
    initialSize.width = w;
    initialSize.height = h;

    // size is abnormal, destroy
    if (!canRender()) {
      await destroy?.(instance.value);

      return;
    }

    // resize
    if (isRendered()) {
      resize?.(instance.value);

      return;
    }

    // render
    instance.value = await render?.();
  }

  scope.run(() => {
    watch([width, height], ([newWidth, newHeight]) => {
      renderBySize(newWidth, newHeight);
    });
  });

  onScopeDispose(() => {
    destroy();
    scope.stop();
  });

  return {
    instance,
    isRendered
  };
}
