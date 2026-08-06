import type { ScrollToOptions } from 'lenis';
import type { InjectionKey } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export interface BigScrollbarRef {
  scrollbarInstRef?:
    | { value?: BigScrollbarInstance | null }
    | BigScrollbarInstance
    | null;
}

interface BigScrollbarInstance {
  containerRef?: HTMLElement | null;
  contentRef?: HTMLElement | null;
}

export type BigScrollEvent = Lenis;

export interface BigScroll {
  readonly lenis: Lenis | undefined;
  onScroll: (listener: (event: BigScrollEvent) => void) => () => void;
  registerScrollbar: (scrollbar: BigScrollbarRef | null | undefined) => void;
  unregisterScrollbar: (scrollbar: BigScrollbarRef | null | undefined) => void;
  scrollTo: (target: number | string | HTMLElement, options?: ScrollToOptions) => void;
  destroy: () => void;
}

export const bigScrollKey: InjectionKey<BigScroll> = Symbol('big-scroll');

export function createBigScroll(): BigScroll {
  let lenis: Lenis | undefined;
  let scrollbar: BigScrollbarRef | null | undefined;
  let unsubscribeScroll: (() => void) | undefined;
  const scrollListeners = new Set<(event: BigScrollEvent) => void>();

  function notifyScroll(event: BigScrollEvent) {
    scrollListeners.forEach(listener => listener(event));
    ScrollTrigger.update();
  }

  function tick(time: number) {
    lenis?.raf(time * 1000);
  }

  function destroy() {
    unsubscribeScroll?.();
    unsubscribeScroll = undefined;
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = undefined;
    scrollbar = undefined;
  }

  function registerScrollbar(nextScrollbar: BigScrollbarRef | null | undefined) {
    const scrollbarInst = nextScrollbar?.scrollbarInstRef;
    const instance = scrollbarInst
      && ('containerRef' in scrollbarInst ? scrollbarInst : 'value' in scrollbarInst ? scrollbarInst.value : undefined);
    const wrapper = instance?.containerRef;
    const content = instance?.contentRef;

    if (!wrapper || !content) {
      return;
    }

    destroy();
    scrollbar = nextScrollbar;
    lenis = new Lenis({ wrapper, content, autoRaf: false, smoothWheel: true });
    unsubscribeScroll = lenis.on('scroll', notifyScroll);
    gsap.ticker.add(tick);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  function unregisterScrollbar(currentScrollbar: BigScrollbarRef | null | undefined) {
    if (!currentScrollbar || currentScrollbar === scrollbar) {
      destroy();
    }
  }

  function onScroll(listener: (event: BigScrollEvent) => void) {
    scrollListeners.add(listener);
    return () => scrollListeners.delete(listener);
  }

  function scrollTo(target: number | string | HTMLElement, options?: ScrollToOptions) {
    lenis?.scrollTo(target, options);
  }

  return {
    get lenis() {
      return lenis;
    },
    onScroll,
    registerScrollbar,
    unregisterScrollbar,
    scrollTo,
    destroy
  };
}
