<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { bigScrollKey } from '@/layouts/big/composables/useBigScroll';
import { gsap, ScrollTrigger } from '@/plugins';

interface CaseStudy {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  capabilities: string[];
  image: string;
  alt: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'agronomy',
    eyebrow: '01 / KNOWLEDGE',
    title: '学农技',
    summary: '百科技术、专家视频、防治技术，帮助每一个生产现场更快找到可靠答案。',
    capabilities: ['百科技术', '专家视频', '防治技术'],
    image: 'https://www.whqdxz.com:8081/dy/file/QDXZ/img/222.jpg',
    alt: '掌上植保农技学习与技术服务界面'
  },
  {
    id: 'protection',
    eyebrow: '02 / PROTECTION',
    title: '病虫害防治技术',
    summary: '从发生趋势到防治动作，把关键判断提前一步，让防治快人一步。',
    capabilities: ['一键查询', '提前预知', '防治快人一步'],
    image: 'https://www.whqdxz.com:8081/dy/file/QDXZ/img/1.jpg',
    alt: '病虫害防治技术与趋势查询界面'
  },
  {
    id: 'experts',
    eyebrow: '03 / EXPERT NETWORK',
    title: '问专家',
    summary: '疑难杂症？专家在线解答，让田间经验与专业判断在同一处汇合。',
    capabilities: ['在线提问', '专家解答', '经验沉淀'],
    image: 'https://www.whqdxz.com:8081/dy/file/QDXZ/img/2.jpg',
    alt: '农业专家在线解答与问题咨询界面'
  },
  {
    id: 'governance',
    eyebrow: '04 / GOVERNANCE',
    title: '预警与分析管理',
    summary: '综合人工与物联网数据，对病虫害发生情况进行科学有效的分析预测。',
    capabilities: ['防治预警', '分析管理', '监测范围管理'],
    image: 'https://www.whqdxz.com:8081/dy/file/QDXZ/img/4.png',
    alt: '农业病虫害预警与分析管理界面'
  },
  {
    id: 'operations',
    eyebrow: '05 / FIELD OPERATIONS',
    title: '实时监测与生产管理',
    summary: '从实时上报到科学考核，再到农业执法与种业管理，形成天空地人四位一体。',
    capabilities: ['实时监测', '测报考核', '发生程度', '农业执法 · 生产管理 · 种业管理'],
    image: 'https://www.whqdxz.com:8081/dy/file/QDXZ/img/6.png',
    alt: '农业生产监测与综合管理界面'
  }
];

const bigScroll = inject(bigScrollKey);
const sectionRef = ref<HTMLElement | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
const progress = computed(() => ((activeIndex.value + 1) / caseStudies.length) * 100);

let matchMedia: ReturnType<typeof gsap.matchMedia> | undefined;
let horizontalTween: gsap.core.Tween | undefined;
let activeTrigger: ScrollTrigger | undefined;

function getDistance() {
  const track = trackRef.value;
  const viewport = viewportRef.value;
  if (!track || !viewport)
    return 0;

  return Math.max(track.scrollWidth - viewport.clientWidth, 0);
}

function updateActiveIndex(value: number) {
  const nextIndex = Math.min(
    caseStudies.length - 1,
    Math.max(0, Math.round(value * (caseStudies.length - 1)))
  );

  if (activeIndex.value !== nextIndex)
    activeIndex.value = nextIndex;
}

function scrollToCase(index: number) {
  const trigger = activeTrigger;
  const distance = getDistance();
  if (!trigger || distance <= 0)
    return;

  const ratio = index / Math.max(caseStudies.length - 1, 1);
  bigScroll?.scrollTo(trigger.start + distance * ratio, { duration: 0.8 });
}

function setupHorizontalRail() {
  const section = sectionRef.value;
  const viewport = viewportRef.value;
  const track = trackRef.value;
  const scroller = bigScroll?.scroller;
  console.log('setupHorizontalRail', { section, viewport, track, scroller });
  if (!section || !viewport || !track || !scroller)
    return;
  console.log('==========');

  horizontalTween?.kill();
  activeTrigger?.kill();
  horizontalTween = undefined;
  activeTrigger = undefined;

  matchMedia = gsap.matchMedia();
  matchMedia.add(
    {
      desktop: '(min-width: 768px)',
      allowMotion: '(prefers-reduced-motion: no-preference)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    },
    context => {
      const isDesktop = Boolean(context.conditions?.desktop);
      const reduceMotion = Boolean(context.conditions?.reduceMotion);

      gsap.set(track, { x: 0 });
      activeIndex.value = 0;

      if (!isDesktop || reduceMotion) {
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return;
      }

      const distance = getDistance();
      if (distance <= 0)
        return;

      horizontalTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          id: 'case-study-horizontal-rail',
          trigger: section,
          scroller,
          pin: true,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: trigger => updateActiveIndex(trigger.progress)
        }
      });
      activeTrigger = horizontalTween.scrollTrigger ?? undefined;

      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    section
  );
}

onMounted(async () => {
  await nextTick();
  console.log('[CaseStudy] scroller at mount:', bigScroll?.scroller);
  setupHorizontalRail();
});

onBeforeUnmount(() => {
  matchMedia?.revert();
  horizontalTween?.kill();
  activeTrigger?.kill();
  horizontalTween = undefined;
  activeTrigger = undefined;
});
</script>

<template>
  <section ref="sectionRef" class="case-study-showcase" aria-labelledby="case-study-title">
    <div ref="viewportRef" class="case-study-viewport">
      <div class="case-study-chrome">
        <div class="case-study-chrome-copy">
          <span id="case-study-title" class="case-study-chrome-title">案例分享</span>
        </div>
        <div class="case-study-progress">
          <span class="case-study-progress-count">{{ String(activeIndex + 1).padStart(2, '0') }} / {{ String(caseStudies.length).padStart(2, '0') }}</span>
          <span class="case-study-progress-track"><span :style="{ transform: `scaleX(${progress / 100})` }" /></span>
        </div>
      </div>

      <div ref="trackRef" class="case-study-track">
        <article
          v-for="(item, index) in caseStudies"
          :key="item.id"
          class="case-study-card"
          :class="{ 'is-active': activeIndex === index }"
          :aria-label="`${index + 1} / ${caseStudies.length}: ${item.title}`"
        >
          <div class="case-study-copy">
            <h3>{{ item.title }}</h3>
            <div class="case-study-meta">
              <span class="case-study-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span>{{ item.eyebrow }}</span>
            </div>
            <p>{{ item.summary }}</p>
            <ul class="case-study-capabilities" :aria-label="`${item.title}能力`">
              <li v-for="capability in item.capabilities" :key="capability">
                {{ capability }}
              </li>
            </ul>
            <button
              v-if="index !== activeIndex"
              type="button"
              class="case-study-jump"
              :aria-label="`查看${item.title}`"
              @click="scrollToCase(index)"
            >
              <span>查看案例</span>
              <span class="case-study-jump-arrow" aria-hidden="true">→</span>
            </button>
          </div>
          <div class="case-study-media">
            <img :src="item.image" :alt="item.alt" :loading="index === 0 ? 'eager' : 'lazy'">
            <span class="case-study-media-caption">掌上植保 / {{ String(index + 1).padStart(2, '0') }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.case-study-showcase {
  min-height: 100vh;
  color: #fff;
  position: relative;
}

.case-study-viewport {
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  background:
    radial-gradient(circle at 82% 45%, rgba(0, 163, 207, 0.16), transparent 32%),
    linear-gradient(120deg, rgba(4, 13, 20, 0.94), rgba(4, 13, 20, 0.52) 60%, rgba(4, 13, 20, 0.86));
}

.case-study-track {
  display: flex;
  align-items: stretch;
  gap: clamp(22px, 3vw, 52px);
  width: max-content;
  padding: clamp(90px, 12vh, 150px) clamp(7vw, 12vw, 180px) clamp(64px, 8vh, 96px);
  will-change: transform;
}

.case-study-card {
  display: grid;
  grid-template-columns: minmax(300px, 0.7fr) minmax(520px, 1.3fr);
  gap: clamp(28px, 5vw, 84px);
  width: min(84vw, 1180px);
  min-height: min(70vh, 680px);
  padding: clamp(26px, 4vw, 64px);
  border: 1px solid rgba(196, 243, 254, 0.14);
  border-radius: 10px;
  background: rgba(4, 13, 20, 0.7);
  box-shadow: 0 22px 80px color-mix(in srgb, #040d14 25%, transparent);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
  transition: border-color 0.35s, background 0.35s;
}

.case-study-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(115deg, rgba(0, 163, 207, 0.11), transparent 42%);
  opacity: 0.55;
}

.case-study-card.is-active {
  border-color: rgba(196, 243, 254, 0.36);
  background: rgba(4, 13, 20, 0.8);
}

.case-study-copy,
.case-study-media {
  min-width: 0;
  position: relative;
  z-index: 1;
}

.case-study-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.case-study-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  color: rgba(196, 243, 254, 0.62);
  font-size: 11px;
  letter-spacing: 0.14em;
  line-height: 1.4;
}

.case-study-index {
  color: #00a3cf;
  font-variant-numeric: tabular-nums;
}

.case-study-copy h3 {
  max-width: 10ch;
  margin: 20px 0 0;
  color: #fff;
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 800;
  line-height: 0.96;
  letter-spacing: -0.035em;
}

.case-study-copy p {
  max-width: 36ch;
  margin: 26px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: clamp(14px, 1.3vw, 16px);
  line-height: 1.65;
}

.case-study-capabilities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.case-study-capabilities li {
  padding: 7px 11px;
  border: 1px solid rgba(0, 163, 207, 0.34);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.76);
  background: rgba(0, 163, 207, 0.07);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.case-study-jump {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  margin-top: 34px;
  padding: 0;
  border: 0;
  color: rgba(196, 243, 254, 0.78);
  background: transparent;
  font-size: 11px;
  letter-spacing: 0.12em;
  transition: color 0.25s;
}

.case-study-jump:hover,
.case-study-jump:focus-visible {
  color: #fff;
}

.case-study-jump:focus-visible {
  outline: 2px solid #c4f3fe;
  outline-offset: 6px;
}

.case-study-jump-arrow {
  color: #00a3cf;
  font-size: 16px;
  transition: transform 0.25s;
}

.case-study-jump:hover .case-study-jump-arrow {
  transform: translateX(4px);
}

.case-study-media {
  align-self: center;
  aspect-ratio: 1.32;
  min-height: 280px;
  overflow: hidden;
  border: 1px solid rgba(196, 243, 254, 0.2);
  border-radius: 8px;
  background: #07141d;
}

.case-study-media::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(4, 13, 20, 0.42), transparent 30%, transparent 70%, rgba(4, 13, 20, 0.18)),
    linear-gradient(180deg, rgba(4, 13, 20, 0.08), transparent 54%, rgba(4, 13, 20, 0.56));
}

.case-study-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: saturate(0.88) contrast(1.04);
  transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s;
}

.case-study-card.is-active .case-study-media img {
  transform: scale(1.025);
  filter: saturate(1.05) contrast(1.06);
}

.case-study-media-caption {
  position: absolute;
  right: 18px;
  bottom: 16px;
  z-index: 2;
  color: rgba(196, 243, 254, 0.68);
  font-size: 11px;
  letter-spacing: 0.14em;
}

.case-study-chrome {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  width: min(84vw, 1180px);
  position: absolute;
  z-index: 4;
  top: clamp(28px, 5vh, 58px);
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.case-study-chrome-copy {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.case-study-chrome-title {
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.case-study-progress {
  display: flex;
  align-items: center;
  gap: 14px;
}

.case-study-progress-count {
  color: rgba(196, 243, 254, 0.66);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.12em;
}

.case-study-progress-track {
  display: block;
  width: clamp(110px, 12vw, 180px);
  height: 1px;
  overflow: hidden;
  background: rgba(196, 243, 254, 0.2);
}

.case-study-progress-track span {
  display: block;
  height: 100%;
  width: 100%;
  background: #00a3cf;
  transform-origin: left center;
  transition: transform 0.25s ease-out;
}

@media (max-width: 767px) {
  .case-study-viewport {
    display: block;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 163, 207, 0.6) transparent;
  }

  .case-study-track {
    gap: 16px;
    padding: 98px 8vw 76px;
  }

  .case-study-card {
    grid-template-columns: 1fr;
    gap: 28px;
    width: 84vw;
    min-height: auto;
    padding: 24px;
  }

  .case-study-copy h3 {
    max-width: 12ch;
    margin-top: 16px;
    font-size: clamp(36px, 12vw, 52px);
  }

  .case-study-copy p {
    margin-top: 18px;
  }

  .case-study-capabilities {
    margin-top: 20px;
  }

  .case-study-media {
    min-height: 220px;
  }

  .case-study-chrome {
    width: 84vw;
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .case-study-chrome-copy {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

}

@media (prefers-reduced-motion: reduce) {
  .case-study-media img,
  .case-study-jump-arrow,
  .case-study-jump,
  .case-study-card,
  .case-study-progress-track span {
    transition: none;
  }
}
</style>
