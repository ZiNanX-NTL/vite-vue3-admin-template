<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import type { EarthTransitionConfig, EarthViewKey } from './config/earthViews';
import type { ProjectMarkerConfig } from './config/projectMarkers';
import type { ScrollShowcaseChangeSource, ScrollShowcaseItem } from './types';
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { bigScrollKey } from '@/layouts/big/composables/useBigScroll';
import { gsap, ScrollTrigger } from '@/plugins';
import BusinessLayoutSection from './components/BusinessLayoutSection.vue';
import CaseStudyShowcase from './components/CaseStudyShowcase.vue';
import EarthStage from './components/EarthStage.vue';
import OverviewSection from './components/OverviewSection.vue';
import ScrollShowcase from './components/ScrollShowcase.vue';
import { earthViewPresets } from './config/earthViews';

type EarthStageInstance = ComponentPublicInstance & {
  setScrollTransition: (
    fromView: EarthViewKey,
    toView: EarthViewKey,
    progress: number,
    options?: {
      transparentStart?: boolean;
      fromHeroProgress?: number;
    }
  ) => void;
};

type EarthScrubTransition = Extract<EarthTransitionConfig, { mode: 'scrub' }>;

type ScrollShowcaseInstance = ComponentPublicInstance & {
  getSections: () => (HTMLElement | null)[];
};

const router = useRouter();
const bigScroll = inject(bigScrollKey);
const scrollbarRef = ref();
const earthStageRef = ref<EarthStageInstance | null>(null);
const showcaseRef = ref<ScrollShowcaseInstance | null>(null);
const activeEarthView = ref<EarthViewKey>('hero');
const heroProgress = ref(0);
const isEarthSticky = computed(() => activeEarthView.value !== 'hero');
const scrollDrivenEarthView = ref<EarthViewKey | null>(null);
const earthViewDriver = computed<'direct' | 'scroll'>(() => (
  scrollDrivenEarthView.value ? 'scroll' : 'direct'
));
let stopEarthScrollListener: (() => void) | undefined;
let earthScrollMatchMedia: ReturnType<typeof gsap.matchMedia> | undefined;
let earthScrollTriggers: ScrollTrigger[] = [];
let earthScrollTweens: gsap.core.Tween[] = [];
let earthScrollSetupFrame: number | undefined;
let earthScrollRefreshFrame: number | undefined;

const showcaseItems: ScrollShowcaseItem[] = [
  {
    id: 'section1',
    label: '掌上植保',
    title: '掌上植保',
    description: '掌上植保。',
    earthView: 'overview'
  },
  {
    id: 'section2',
    label: '经营分布',
    title: '分布',
    description: '持续完善全国布局，形成全国化的服务网络。',
    earthView: 'business'
  },
  {
    id: 'section3',
    label: '案例分享',
    title: '案例分享',
    description: '从掌上植保到生产管理，展示农业数字化服务如何落到每一块农田。',
    earthView: 'hidden',
    standalone: true
  }
];

function handleActiveSectionChange(
  item: ScrollShowcaseItem | null,
  _index: number | null,
  source: ScrollShowcaseChangeSource
) {
  const nextView = item ? item.earthView ?? 'hidden' : 'hero';
  activeEarthView.value = nextView;

  if (source === 'scroll')
    return;

  if (!item) {
    scrollDrivenEarthView.value = null;
    return;
  }

  const transition = earthViewPresets[nextView].earthTransition;
  const trigger = ScrollTrigger.getById(`earth-${item.id}`);

  if (transition?.mode === 'scrub' && trigger && (trigger.isActive || trigger.progress < 1)) {
    scrollDrivenEarthView.value = nextView;
  } else {
    scrollDrivenEarthView.value = null;
  }
}

function navigateToProject(target: ProjectMarkerConfig['target']) {
  if (!target) {
    console.warn('[project-markers] missing navigation target');
    return;
  }

  if (target.type === 'route') {
    if (target.name) {
      router.push({ name: target.name, query: target.query, params: target.params }).catch(error => {
        console.warn('[project-markers] route navigation failed', error);
      });
      return;
    }

    if (target.path) {
      router.push({ path: target.path, query: target.query, params: target.params }).catch(error => {
        console.warn('[project-markers] route navigation failed', error);
      });
      return;
    }

    console.warn('[project-markers] route target requires path or name');
    return;
  }

  try {
    const url = new URL(target.href, window.location.origin);
    if (target.target === '_self') {
      window.location.assign(url.href);
      return;
    }

    window.open(url.href, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.warn('[project-markers] invalid URL target', target.href, error);
  }
}

function handleProjectSelect(marker: ProjectMarkerConfig) {
  navigateToProject(marker.target);
}

function resolveScrollTransitionOptions(transition: EarthScrubTransition, trigger?: ScrollTrigger) {
  const transitionDistance = Math.max(window.innerHeight - 300, 1);

  return {
    transparentStart: transition.transparentStart,
    fromHeroProgress: transition.fromView === 'hero'
      ? gsap.utils.clamp(0, 1, trigger ? trigger.start / transitionDistance : heroProgress.value)
      : undefined
  };
}

function killEarthScrollArtifacts() {
  if (earthScrollRefreshFrame !== undefined) {
    cancelAnimationFrame(earthScrollRefreshFrame);
    earthScrollRefreshFrame = undefined;
  }
  earthScrollTriggers.forEach(trigger => trigger.kill());
  earthScrollTweens.forEach(tween => tween.kill());
  earthScrollTriggers = [];
  earthScrollTweens = [];
  scrollDrivenEarthView.value = null;
}

function validateEarthScrollRanges() {
  if (!import.meta.env.DEV)
    return;

  const ranges = earthScrollTriggers
    .map(trigger => ({
      id: trigger.vars.id ?? 'unknown',
      start: trigger.start,
      end: trigger.end
    }))
    .sort((left, right) => left.start - right.start);

  ranges.slice(0, -1).forEach((range, index) => {
    const nextRange = ranges[index + 1];
    if (nextRange && range.end > nextRange.start + 1) {
      console.warn(
        `[earth-scroll] overlapping scrub ranges: ${range.id} (${range.start}-${range.end}) and ${nextRange.id} (${nextRange.start}-${nextRange.end})`
      );
    }
  });
}

function createEarthScrollTransitions() {
  const scroller = bigScroll?.scroller;
  const earthStage = earthStageRef.value;
  const sections = showcaseRef.value?.getSections() ?? [];

  if (!scroller || !earthStage)
    return;

  killEarthScrollArtifacts();
  earthScrollMatchMedia?.revert();
  earthScrollMatchMedia = gsap.matchMedia();
  earthScrollMatchMedia.add(
    {
      allowMotion: '(prefers-reduced-motion: no-preference)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    },
    context => {
      const isReducedMotion = Boolean(context.conditions?.reduceMotion);

      showcaseItems.forEach((item, index) => {
        const view = item.earthView;
        const section = sections[index];
        const transition = view ? earthViewPresets[view].earthTransition : undefined;

        if (!section || !view || !transition || transition.mode !== 'scrub')
          return;

        const updateEarth = (progress: number, trigger?: ScrollTrigger) => {
          if (scrollDrivenEarthView.value !== view)
            return;

          earthStage.setScrollTransition(
            transition.fromView,
            view,
            progress,
            resolveScrollTransitionOptions(
              transition,
              trigger ?? ScrollTrigger.getById(`earth-${item.id}`)
            )
          );
        };
        const acquireScrollControl = (trigger: ScrollTrigger, progress: number) => {
          scrollDrivenEarthView.value = view;
          updateEarth(progress, trigger);
        };
        const releaseScrollControl = () => {
          if (scrollDrivenEarthView.value === view)
            scrollDrivenEarthView.value = null;
        };

        if (isReducedMotion) {
          earthScrollTriggers.push(ScrollTrigger.create({
            id: `earth-${item.id}`,
            trigger: section,
            scroller,
            start: transition.start,
            end: transition.end,
            onEnter: self => acquireScrollControl(self, 1),
            onLeave: self => {
              updateEarth(1, self);
              releaseScrollControl();
            },
            onEnterBack: self => acquireScrollControl(self, 1),
            onLeaveBack: self => {
              updateEarth(0, self);
              releaseScrollControl();
            },
            onRefresh: self => {
              if (self.isActive)
                acquireScrollControl(self, 1);
            }
          }));
          return;
        }

        const progressProxy = { value: 0 };
        const proxyTween = gsap.to(progressProxy, {
          value: 1,
          duration: 1,
          paused: true,
          ease: 'none',
          onUpdate: () => updateEarth(progressProxy.value)
        });
        earthScrollTweens.push(proxyTween);
        earthScrollTriggers.push(ScrollTrigger.create({
          id: `earth-${item.id}`,
          trigger: section,
          scroller,
          start: transition.start,
          end: transition.end,
          scrub: transition.scrub ?? true,
          animation: proxyTween,
          invalidateOnRefresh: true,
          onEnter: self => acquireScrollControl(self, self.progress),
          onLeave: self => {
            updateEarth(1, self);
            releaseScrollControl();
          },
          onEnterBack: self => acquireScrollControl(self, 1),
          onLeaveBack: self => {
            updateEarth(0, self);
            releaseScrollControl();
          },
          onRefresh: self => {
            if (self.isActive)
              acquireScrollControl(self, self.progress);
          }
        }));
      });

      earthScrollRefreshFrame = requestAnimationFrame(() => {
        earthScrollRefreshFrame = undefined;
        ScrollTrigger.refresh();
        validateEarthScrollRanges();
      });

      return killEarthScrollArtifacts;
    }
  );
}

onMounted(async () => {
  bigScroll?.registerScrollbar(scrollbarRef.value);
  stopEarthScrollListener = bigScroll?.onScroll(({ scroll }) => {
    const transitionDistance = Math.max(window.innerHeight - 300, 1);
    heroProgress.value = Math.min(Math.max(scroll / transitionDistance, 0), 1);
  });

  await nextTick();
  earthScrollSetupFrame = requestAnimationFrame(createEarthScrollTransitions);
});

onBeforeUnmount(() => {
  if (earthScrollSetupFrame !== undefined)
    cancelAnimationFrame(earthScrollSetupFrame);
  stopEarthScrollListener?.();
  earthScrollMatchMedia?.revert();
  killEarthScrollArtifacts();
  bigScroll?.unregisterScrollbar(scrollbarRef.value);
});
</script>

<template>
  <NScrollbar ref="scrollbarRef" class="size-full" trigger="none">
    <div class="visualization-page relative">
      <div class="pointer-events-none inset-0 absolute z-0">
        <EarthStage
          ref="earthStageRef"
          class="h-100vh w-full"
          :class="isEarthSticky ? 'top-0 sticky' : 'left-0 top-0 absolute'"
          :view="activeEarthView"
          :view-driver="earthViewDriver"
          :hero-progress="heroProgress"
          @select="handleProjectSelect"
        />
      </div>

      <main class="pointer-events-none relative z-1">
        <section class="h-100vh pointer-events-none" aria-label="地球项目总览" />

        <ScrollShowcase
          ref="showcaseRef"
          class="pointer-events-auto"
          :items="showcaseItems"
          @active-section-change="handleActiveSectionChange"
        >
          <template #section="{ item }">
            <OverviewSection v-if="item.id === 'section1'" class="w-[68vw] max-md:w-[84vw]" />
            <BusinessLayoutSection v-else-if="item.id === 'section2'" class="w-[68vw] max-md:w-[84vw]" />
            <CaseStudyShowcase v-else-if="item.id === 'section3'" />
          </template>
        </ScrollShowcase>
      </main>
    </div>
  </NScrollbar>
</template>

<style scoped>
.visualization-page {
  isolation: isolate;
  background: #040d14;
}
</style>
