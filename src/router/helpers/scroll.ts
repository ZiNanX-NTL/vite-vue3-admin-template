import type { RouterScrollBehavior } from 'vue-router';
import { useAppStore, useTabStore } from '@/store';

export const scrollBehavior: RouterScrollBehavior = async (to, from) => {
  return new Promise(resolve => {
    const app = useAppStore();
    const tab = useTabStore();

    if (to.hash) {
      const el = document.querySelector(to.hash);
      if (el) {
        resolve({
          el,
          behavior: 'smooth'
        });
      }
    }

    const { contentRef }: { contentRef: any } = app;
    const { containerScrollTop = 0, containerScrollLeft = 0 } = contentRef?.scrollbarInstRef || {};
    const [scrollLeft, scrollTop] = [containerScrollLeft, containerScrollTop];

    const isFromCached = Boolean(from.meta.keepAlive);
    if (isFromCached) {
      tab.recordTabScrollPosition(from.path, { left: scrollLeft, top: scrollTop });
    }

    const { left, top } = tab.getTabScrollPosition(to.path);
    const scrollPosition = {
      left,
      top
    };

    setTimeout(() => {
      if (contentRef) {
        contentRef?.scrollTo({ top: scrollPosition.top, left: scrollPosition.left, behavior: 'auto' });
      }
    }, 350);
  });
};
