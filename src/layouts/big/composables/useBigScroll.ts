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
  readonly scroller: HTMLElement | undefined;
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
  let scroller: HTMLElement | undefined;
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
    if (scroller) {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.scroller === scroller) {
          trigger.kill();
        }
      });
    }
    scroller = undefined;
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
    scroller = wrapper;
    lenis = new Lenis({ wrapper, content, autoRaf: false, smoothWheel: true });

    ScrollTrigger.scrollerProxy(wrapper, {
      scrollTop(value) {
        if (arguments.length) {
          lenis?.scrollTo(value as number, { immediate: true });
        }
        return lenis?.animatedScroll ?? wrapper.scrollTop;
      },
      scrollLeft(value) {
        if (arguments.length) {
          wrapper.scrollLeft = value as number;
        }
        return wrapper.scrollLeft;
      },
      scrollHeight: () => content.scrollHeight,
      scrollWidth: () => content.scrollWidth,
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      }),
      pinType: getComputedStyle(wrapper).transform !== 'none' ? 'transform' : 'fixed'
    });

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
    get scroller() {
      return scroller;
    },
    onScroll,
    registerScrollbar,
    unregisterScrollbar,
    scrollTo,
    destroy
  };
}
