<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { inject, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { bigScrollKey } from '@/layouts/big/composables/useBigScroll';
import { gsap, ScrollTrigger } from '@/plugins';
import { overviewContent } from '../config/overview';

const rootRef = ref<HTMLElement | null>(null);
const bigScroll = inject(bigScrollKey);

let mediaQuery: ReturnType<typeof gsap.matchMedia> | undefined;
let retryTimer: number | undefined;

function setReducedMotionState(root: HTMLElement) {
  gsap.set(root.querySelectorAll('[data-motion]'), {
    autoAlpha: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });
  gsap.set(root.querySelectorAll<HTMLElement>('[data-progress]'), {
    scaleX: (_index, target) => Number(target.dataset.value ?? 1)
  });
  gsap.set(root.querySelectorAll('[data-scanline]'), { x: 0 });
}

function createAnimations(root: HTMLElement, scroller: HTMLElement) {
  const mm = gsap.matchMedia();

  mm.add(
    {
      allowMotion: '(prefers-reduced-motion: no-preference)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
      compact: '(max-width: 767px)'
    },
    context => {
      const compact = context.conditions?.compact;
      if (context.conditions?.reduceMotion) {
        setReducedMotionState(root);
        return;
      }

      const intro = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' }
      });
      intro
        .fromTo(root.querySelector('[data-motion="eyebrow"]'), { autoAlpha: 0, x: -34 }, { autoAlpha: 1, x: 0, duration: 0.48 })
        .fromTo(root.querySelector('[data-motion="title"]'), { autoAlpha: 0, y: 56, clipPath: 'inset(0 0 100% 0)' }, { autoAlpha: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.78 }, '-=0.22')
        .fromTo(root.querySelector('[data-motion="description"]'), { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.56 }, '-=0.36')
        .fromTo(root.querySelectorAll('[data-motion="metric"]'), { autoAlpha: 0, x: 42 }, { autoAlpha: 1, x: 0, duration: 0.58, stagger: 0.1 }, '-=0.16')
        .fromTo(root.querySelectorAll<HTMLElement>('[data-progress]'), { scaleX: 0 }, {
          scaleX: (_index, target) => Number(target.dataset.value ?? 1),
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.08
        }, '<');

      const moduleGrid = root.querySelector('[data-section="modules"]');
      const moduleCards = root.querySelectorAll('[data-motion="module"]');
      const moduleTimeline = gsap.timeline({ paused: true });
      if (moduleCards.length) {
        moduleTimeline.fromTo(moduleCards, {
          autoAlpha: 0,
          x: index => index % 2 === 0 ? -44 : 44,
          y: 22
        }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.65,
          ease: 'power3.out',
          stagger: 0.12
        });
      }

      const workflow = root.querySelector('[data-section="workflow"]');
      const workflowNodes = root.querySelectorAll('[data-motion="workflow"]');
      const workflowTimeline = gsap.timeline({ paused: true });
      if (workflowNodes.length) {
        workflowTimeline.fromTo(workflowNodes, { autoAlpha: 0, y: 36, scale: 0.94 }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.14
        });
      }

      const fieldPanel = root.querySelector<HTMLElement>('[data-field-panel]');
      const scrub = gsap.timeline({ paused: true });
      scrub
        .fromTo(root.querySelector('[data-motion="orbit"]'), { rotation: -35, y: 30 }, { rotation: 155, y: -28, ease: 'none' }, 0)
        .fromTo(root.querySelector('[data-scanline]'), { x: -12 }, { x: () => (fieldPanel?.clientWidth ?? 320) + 12, ease: 'none' }, 0)
        .fromTo(root.querySelector('[data-motion="plot"]'), { y: compact ? 10 : 34 }, { y: compact ? -10 : -28, ease: 'none' }, 0)
        .fromTo(root.querySelector('.overview-grid'), { backgroundPosition: '0px 0px' }, { backgroundPosition: '0px -90px', ease: 'none' }, 0);

      const scrollTrigger = ScrollTrigger.create({
        trigger: root,
        scroller,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: self => {
          scrub.progress(self.progress);
          self.progress > 0.08 ? intro.play() : intro.reverse();
          moduleGrid && self.progress > 0.3 ? moduleTimeline.play() : moduleTimeline.reverse();
          workflow && self.progress > 0.62 ? workflowTimeline.play() : workflowTimeline.reverse();
        },
        onRefresh: () => {
          scrub.invalidate();
        }
      });

      return () => {
        intro.kill();
        moduleTimeline.kill();
        workflowTimeline.kill();
        scrub.kill();
        scrollTrigger.kill();
      };
    },
    root
  );

  return mm;
}

onMounted(async () => {
  await nextTick();
  const root = rootRef.value;
  if (!root)
    return;

  let attempts = 0;
  const mountAnimations = () => {
    const scroller = bigScroll?.scroller;
    if (!scroller && attempts++ < 20) {
      retryTimer = window.setTimeout(mountAnimations, 50);
      return;
    }
    if (!scroller)
      return;
    mediaQuery = createAnimations(root, scroller);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  mountAnimations();
});

onBeforeUnmount(() => {
  if (retryTimer)
    window.clearTimeout(retryTimer);
  mediaQuery?.revert();
  mediaQuery = undefined;
});
</script>

<template>
  <section ref="rootRef" class="overview-root text-white/85 w-full relative overflow-hidden" aria-labelledby="overview-title">
    <div class="overview-grid opacity-60 pointer-events-none inset-0 absolute" aria-hidden="true" />
    <div class="mx-auto px-18px pb-100px pt-30px max-w-1180px relative lg:px-44px sm:px-32px">
      <header class="gap-42px grid items-end lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div class="max-w-720px">
          <p data-motion="eyebrow" class="text-[11px] text-[#79f7c0] tracking-[0.24em] mb-18px flex gap-10px uppercase items-center">
            <span class="rounded-full bg-[#79f7c0] h-6px w-6px shadow-[0_0_18px_rgba(121,247,192,0.8)]" aria-hidden="true" />
            {{ overviewContent.eyebrow }}
          </p>
          <h1 id="overview-title" data-motion="title" class="text-[clamp(38px,5.5vw,78px)] text-white leading-[1.02] tracking-[-0.035em] font-600 m-0 max-w-680px">
            <template v-for="(line, index) in overviewContent.title.split('\n')" :key="line">
              <span class="block" :class="index === 1 ? 'text-[#9fdcff]' : ''">{{ line }}</span>
            </template>
          </h1>
          <p data-motion="description" class="text-16px text-[#9aaec3] leading-28px mt-26px max-w-620px sm:text-18px sm:leading-30px">
            {{ overviewContent.description }}
          </p>
        </div>

        <div class="text-12px text-[#7890a8] leading-20px pl-18px border-l border-white/14 lg:mb-8px lg:pl-22px">
          <div class="text-[#b9c9d9] mb-12px flex gap-12px items-center justify-between">
            <span>PLATFORM NOTE</span>
            <span class="text-[10px] text-[#79f7c0] tracking-[0.16em] px-10px py-3px rounded-full bg-[#79f7c0]/10">SIMULATION</span>
          </div>
          <p class="m-0 max-w-300px">
            植保数字化系统将感知、研判与执行连接到同一张农田数据底图。
          </p>
        </div>
      </header>

      <div class="mt-54px gap-12px grid lg:mt-70px sm:gap-16px sm:grid-cols-3">
        <article v-for="metric in overviewContent.metrics" :key="metric.label" data-motion="metric" class="overview-metric px-16px pb-16px pt-18px border border-white/10 bg-[#07131b]/72 sm:px-20px sm:pt-20px">
          <div class="mb-20px flex gap-12px items-start justify-between">
            <p class="text-12px text-[#8ca3b9] tracking-[0.12em] m-0">
              {{ metric.label }}
            </p>
            <span class="i-carbon-arrow-up-right text-15px text-[#79f7c0]" aria-hidden="true" />
          </div>
          <p class="text-[clamp(26px,3vw,42px)] text-white leading-none font-600 m-0 tabular-nums">
            {{ metric.value }}
          </p>
          <p class="text-12px text-[#71879e] mb-16px mt-10px">
            {{ metric.detail }}
          </p>
          <div class="bg-white/8 h-2px w-full overflow-hidden" role="progressbar" :aria-label="metric.label" :aria-valuenow="Math.round(metric.progress * 100)" aria-valuemin="0" aria-valuemax="100">
            <span data-progress class="bg-[#79f7c0] h-full block shadow-[0_0_14px_rgba(121,247,192,0.65)] origin-left" :data-value="metric.progress" :style="{ transform: `scaleX(${metric.progress})` }" />
          </div>
        </article>
      </div>

      <div data-section="modules" class="mt-88px gap-28px grid lg:gap-48px lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.75fr)]">
        <div>
          <div class="mb-26px flex gap-14px items-end justify-between">
            <div>
              <p class="text-[11px] text-[#77b8ff] tracking-[0.22em] mb-10px uppercase">
                SYSTEM CAPABILITIES
              </p>
              <h2 class="text-28px text-white leading-tight tracking-[-0.025em] font-500 m-0 sm:text-36px">
                把复杂农事，变成可执行的系统语言
              </h2>
            </div>
            <span class="text-[10px] text-[#5e748b] tracking-[0.18em] hidden sm:block">04 MODULES</span>
          </div>

          <div class="gap-10px grid sm:grid-cols-2">
            <article v-for="module in overviewContent.modules" :key="module.index" data-motion="module" class="overview-module group p-18px border border-white/10 bg-[#07131b]/58 transition-colors duration-300 sm:p-22px hover:border-[#79f7c0]/42 hover:bg-[#0a1d26]/82">
              <div class="mb-36px flex gap-14px items-start justify-between">
                <span class="text-18px text-[#79f7c0] border border-[#79f7c0]/22 bg-[#79f7c0]/6 flex size-36px transition-transform duration-300 items-center justify-center group-hover:scale-105">
                  <Icon :icon="module.icon" aria-hidden="true" />
                </span>
                <span class="text-[10px] text-[#6c849b] tracking-[0.14em]">{{ module.signal }}</span>
              </div>
              <p class="text-[11px] text-[#79f7c0] tracking-[0.18em] mb-9px">
                {{ module.index }}
              </p>
              <h3 class="text-18px text-white leading-26px font-500 m-0">
                {{ module.title }}
              </h3>
              <p class="text-13px text-[#879db3] leading-22px mb-0 mt-12px">
                {{ module.description }}
              </p>
            </article>
          </div>
        </div>

        <aside data-motion="plot" class="overview-plot p-18px border border-[#77b8ff]/22 bg-[#07131b]/78 relative sm:p-24px" aria-label="示范田实时切片">
          <div data-motion="orbit" class="overview-orbit border border-[#77b8ff]/18 rounded-full size-190px pointer-events-none right-[-66px] top-[-58px] absolute" aria-hidden="true">
            <span class="rounded-full bg-[#77b8ff] size-4px shadow-[0_0_20px_rgba(119,184,255,0.95)] left-1/2 top-1/2 absolute -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div class="mb-26px flex gap-12px items-center justify-between">
            <div>
              <p class="text-[10px] text-[#77b8ff] tracking-[0.2em] mb-8px uppercase">
                LIVE FIELD SLICE
              </p>
              <h2 class="text-20px text-white font-500 m-0">
                {{ overviewContent.demoPlot.name }}
              </h2>
            </div>
            <span class="text-[10px] text-[#79f7c0] tracking-[0.12em] flex gap-6px items-center"><i class="rounded-full bg-[#79f7c0] size-5px shadow-[0_0_12px_rgba(121,247,192,0.8)]" aria-hidden="true" /> LIVE</span>
          </div>

          <div data-field-panel class="p-14px border border-white/10 bg-[#061018]/80 relative overflow-hidden">
            <div class="overview-field opacity-75 inset-0 absolute" aria-hidden="true" />
            <div data-scanline class="bg-[#79f7c0] h-full w-1px shadow-[0_0_18px_rgba(121,247,192,0.95)] left-0 top-0 absolute" aria-hidden="true" />
            <div class="flex flex-col min-h-190px justify-between relative">
              <div class="flex gap-12px items-start justify-between">
                <span class="text-11px text-[#9cb3c8] tracking-[0.16em]">PLOT / {{ overviewContent.demoPlot.id }}</span>
                <span class="text-11px text-[#79f7c0]">{{ overviewContent.demoPlot.status }}</span>
              </div>
              <div class="flex gap-12px items-end justify-between">
                <div>
                  <p class="text-12px text-[#8ca3b9] m-0">
                    {{ overviewContent.demoPlot.crop }}
                  </p>
                  <p class="text-12px text-[#627b92] mb-0 mt-8px">
                    {{ overviewContent.demoPlot.updated }}
                  </p>
                </div>
                <div class="p-5px rounded-full size-86px" :style="{ background: `conic-gradient(#79f7c0 ${overviewContent.demoPlot.health}%, rgba(255,255,255,0.1) 0)` }" role="img" :aria-label="`地块健康度 ${overviewContent.demoPlot.health}%`">
                  <div class="rounded-full bg-[#07131b] flex flex-col size-full items-center justify-center">
                    <strong class="text-22px text-white leading-none tabular-nums">{{ overviewContent.demoPlot.health }}</strong>
                    <span class="text-[9px] text-[#7790a6] tracking-[0.12em] mt-4px">HEALTH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="text-11px mt-16px pt-16px border-t border-white/10 gap-x-16px gap-y-12px grid grid-cols-2">
            <div><span class="text-[#617a91]">SENSOR NODES</span><strong class="text-[#c8d9e8] font-500 mt-4px block">42 online</strong></div>
            <div><span class="text-[#617a91]">LAST SIGNAL</span><strong class="text-[#c8d9e8] font-500 mt-4px block">02 min ago</strong></div>
          </div>
        </aside>
      </div>

      <section data-section="workflow" class="mt-88px py-30px border-y border-white/10 sm:py-38px" aria-labelledby="workflow-title">
        <div class="mb-30px flex flex-wrap gap-16px items-end justify-between">
          <div>
            <p class="text-[11px] text-[#79f7c0] tracking-[0.22em] mb-10px uppercase">
              THE PROTECTION LOOP
            </p>
            <h2 id="workflow-title" class="text-28px text-white leading-tight tracking-[-0.025em] font-500 m-0 sm:text-36px">
              从发现异常，到完成一次闭环
            </h2>
          </div>
          <p class="text-12px text-[#71879e] leading-20px m-0 max-w-300px">
            每一次回传都会成为下一次判断的上下文，系统持续校正而不是重复告警。
          </p>
        </div>

        <ol class="m-0 p-0 list-none gap-16px grid sm:gap-0 sm:grid-cols-4">
          <li v-for="(step, index) in overviewContent.workflow" :key="step.code" data-motion="workflow" class="flex gap-12px relative sm:pr-22px sm:block">
            <div class="text-[10px] text-[#9fdcff] tracking-[0.08em] border border-[#77b8ff]/35 bg-[#77b8ff]/8 flex shrink-0 size-34px items-center justify-center">
              {{ String(index + 1).padStart(2, '0') }}
            </div>
            <div class="sm:mt-16px">
              <p class="text-11px text-[#79f7c0] tracking-[0.18em] m-0">
                {{ step.code }}
              </p>
              <h3 class="text-16px text-white font-500 mb-0 mt-8px">
                {{ step.title }}
              </h3>
              <p class="text-12px text-[#71879e] mb-0 mt-7px">
                {{ step.description }}
              </p>
            </div>
            <span v-if="index < overviewContent.workflow.length - 1" class="bg-[#77b8ff]/32 h-16px w-1px left-34px top-34px absolute sm:h-1px sm:w-[calc(100%-58px)] sm:left-auto sm:right-0 sm:top-17px" aria-hidden="true" />
          </li>
        </ol>
      </section>

      <footer class="text-[10px] text-[#586f86] tracking-[0.14em] pt-28px flex flex-wrap gap-14px items-center justify-between">
        <span>AGRICULTURE INTELLIGENCE / OVERVIEW</span>
        <span>{{ overviewContent.dataNote }}</span>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.overview-root {
  --overview-ink: #07131b;
  --overview-line: rgba(121, 247, 192, 0.1);
  background:
    radial-gradient(circle at 82% 8%, rgba(44, 112, 155, 0.18), transparent 34%),
    linear-gradient(180deg, rgba(3, 11, 17, 0.97), rgba(4, 13, 20, 0.94));
}

.overview-grid {
  background-image:
    linear-gradient(to right, var(--overview-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--overview-line) 1px, transparent 1px);
  background-size: 58px 58px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.75), transparent 70%);
}

.overview-field {
  background:
    linear-gradient(135deg, transparent 44%, rgba(121, 247, 192, 0.14) 44.5%, transparent 45%),
    linear-gradient(40deg, transparent 54%, rgba(119, 184, 255, 0.12) 54.5%, transparent 55%),
    linear-gradient(90deg, rgba(119, 184, 255, 0.08) 1px, transparent 1px),
    linear-gradient(rgba(119, 184, 255, 0.08) 1px, transparent 1px);
  background-size: auto, auto, 34px 34px, 34px 34px;
  mask-image: radial-gradient(circle at center, #000, transparent 78%);
}

.overview-orbit::before,
.overview-orbit::after {
  border: 1px solid rgba(119, 184, 255, 0.18);
  border-radius: 999px;
  content: '';
  inset: 20px;
  position: absolute;
}

.overview-orbit::after {
  border-color: rgba(121, 247, 192, 0.24);
  inset: 42px;
}

@media (prefers-reduced-motion: reduce) {
  .overview-module,
  .overview-metric,
  [data-motion='workflow'] {
    opacity: 1;
  }
}
</style>
