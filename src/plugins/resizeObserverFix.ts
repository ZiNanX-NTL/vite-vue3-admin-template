type DebounceFn = (...args: any[]) => void;

const debounce = (fn: DebounceFn, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback: DebounceFn) {
    super(debounce(callback, 0));
  }
};

export function fixResizeObserver() {}
