<script setup lang="ts">
import { gsap } from 'gsap';
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { bigScrollKey } from '@/layouts/big/composables/useBigScroll';
import { useThemeStore } from '@/store';

interface OverviewFeature {
  label: string;
}

const overviewContent = {
  slogan: '掌上植保',
  title: '让每一块农田\n都成为可计算的生产单元',
  tagline: '农民少跑腿 · 信息多跑路',
  features: [
    { label: '学农技' },
    { label: '寻防治' },
    { label: '问专家' },
    { label: '农友圈' }
  ] as OverviewFeature[],
  ctaText: '病虫害发生趋势一键查'
};

const heroImageUrl = 'https://www.whqdxz.com:8081/dy/file/QDXZ/img/ntb.jpg';

const themeStore = useThemeStore();
const themeColor = computed(() => themeStore.colorScheme[0]);

const bigScroll = inject(bigScrollKey);

const sectionRef = ref<HTMLElement | null>(null);
const sloganRef = ref<HTMLElement | null>(null);
const titleRef = ref<HTMLElement | null>(null);
const featuresRef = ref<HTMLElement | null>(null);
const taglineRef = ref<HTMLElement | null>(null);
const ctaRef = ref<HTMLElement | null>(null);
const mediaRef = ref<HTMLElement | null>(null);

let triggers: ScrollTrigger[] = [];

onMounted(() => {
  requestAnimationFrame(() => {
    const scroller = bigScroll?.scroller;
    const scrollerVars = scroller ? { scroller } : {};

    // 左侧内容：随滚动依次浮现
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 70%',
        end: 'top 30%',
        scrub: 0.9,
        ...scrollerVars
      }
    });

    tl.fromTo(
      sloganRef.value,
      { clipPath: 'inset(100% 0% 0% 0%)', y: 28 },
      { clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'power3.out' },
      0
    );
    tl.fromTo(
      titleRef.value,
      { clipPath: 'inset(100% 0% 0% 0%)', y: 18 },
      { clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'power3.out' },
      0.13
    );
    tl.fromTo(
      featuresRef.value,
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, ease: 'power2.out' },
      0.25
    );
    tl.fromTo(
      taglineRef.value,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, ease: 'power2.out' },
      0.35
    );
    tl.fromTo(
      ctaRef.value,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, ease: 'power2.out' },
      0.42
    );

    if (tl.scrollTrigger)
      triggers.push(tl.scrollTrigger);

    // 右侧图片：clip-path 随滚动连贯展开，不浮动
    const imgAnim = gsap.fromTo(
      mediaRef.value,
      { clipPath: 'inset(12% 18% 12% 0%)', opacity: 0.15 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top bottom',
          end: 'center 50%',
          scrub: 1.2,
          ...scrollerVars
        }
      }
    );

    if (imgAnim.scrollTrigger)
      triggers.push(imgAnim.scrollTrigger);
  });
});

onUnmounted(() => {
  triggers.forEach(t => t.kill());
  triggers = [];
  gsap.killTweensOf(
    [sloganRef.value, titleRef.value, featuresRef.value, taglineRef.value, ctaRef.value, mediaRef.value].filter(Boolean)
  );
});
</script>

<template>
  <section ref="sectionRef" class="overview-section text-white relative" aria-labelledby="overview-title">
    <div class="gap-x-0 gap-y-40px grid items-center lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.2fr)]">
      <div class="">
        <!-- 主标语 -->
        <div ref="sloganRef" class="overflow-hidden">
          <h1
            id="overview-title"
            class="text-[clamp(52px,7.5vw,88px)] text-white leading-[0.92] tracking-[-0.03em] font-900 m-0"
          >
            {{ overviewContent.slogan }}
          </h1>
        </div>

        <!-- 副标题 -->
        <div ref="titleRef" class="mt-22px overflow-hidden">
          <p class="text-[clamp(14px,1.5vw,18px)] text-white/52 leading-[1.65] tracking-[0.005em] m-0 whitespace-pre-line">
            {{ overviewContent.title }}
          </p>
        </div>

        <!-- 特性标签 -->
        <div ref="featuresRef" class="mt-30px flex flex-wrap gap-8px">
          <span
            v-for="feature in overviewContent.features"
            :key="feature.label"
            class="overview-pill text-13px tracking-[0.05em] px-14px py-7px"
            :style="{ '--tc': themeColor }"
          >
            {{ feature.label }}
          </span>
        </div>

        <!-- 标语 -->
        <p
          ref="taglineRef"
          class="text-11px tracking-[0.1em] m-0 mt-14px"
          :style="{ color: `${themeColor}80` }"
        >
          {{ overviewContent.tagline }}
        </p>

        <!-- CTA -->
        <button
          ref="ctaRef"
          type="button"
          class="overview-cta group text-14px text-white/90 tracking-[0.04em] mt-38px px-26px py-14px flex gap-12px items-center relative overflow-hidden"
          :style="{ '--tc': themeColor }"
        >
          <span class="relative z-1">{{ overviewContent.ctaText }}</span>
          <span
            class="i-carbon-chevron-right text-14px transition-transform duration-300 relative z-1 group-hover:translate-x-3px"
            aria-hidden="true"
            :style="{ color: themeColor }"
          />
        </button>
      </div>

      <!-- 媒体区：嵌入背景感，左缘模糊渐隐，无悬浮 -->
      <div ref="mediaRef" class="overview-media w-full relative">
        <span
          class="overview-media-glow pointer-events-none inset-0 absolute"
          aria-hidden="true"
          :style="{ background: `radial-gradient(circle at 58% 36%, ${themeColor}40, transparent 60%)` }"
        />
        <img
          :src="heroImageUrl"
          alt="掌上植保应用界面展示"
          class="overview-media-img w-full block object-cover object-center"
          loading="lazy"
        >
        <div class="overview-media-scanline pointer-events-none inset-0 absolute" aria-hidden="true" />
      </div>
    </div>
  </section>
</template>

<style scoped>
@property --scan-pos {
  syntax: '<percentage>';
  inherits: false;
  initial-value: -40%;
}

.overview-pill {
  border: 1px solid color-mix(in srgb, var(--tc) 30%, transparent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--tc) 6%, transparent);
  backdrop-filter: blur(6px);
  color: rgba(255, 255, 255, 0.72);
  transition: background 0.22s, border-color 0.22s, color 0.22s;
}

.overview-pill:hover {
  background: color-mix(in srgb, var(--tc) 14%, transparent);
  border-color: color-mix(in srgb, var(--tc) 55%, transparent);
  color: rgba(255, 255, 255, 0.95);
}

.overview-cta {
  border: 1px solid color-mix(in srgb, var(--tc) 32%, transparent);
  background: color-mix(in srgb, var(--tc) 8%, transparent);
  backdrop-filter: blur(6px);
  border-radius: 8px;
  transition: background 0.25s, border-color 0.25s;
}

.overview-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  --scan-pos: -40%;
  background: linear-gradient(
    90deg,
    transparent var(--scan-pos),
    color-mix(in srgb, var(--tc) 22%, transparent) calc(var(--scan-pos) + 55%),
    transparent calc(var(--scan-pos) + 100%)
  );
  border-radius: inherit;
  pointer-events: none;
}

.overview-cta:hover::before {
  --scan-pos: 130%;
  transition: --scan-pos 0.52s ease-out;
}

.overview-cta:hover {
  background: color-mix(in srgb, var(--tc) 13%, transparent);
  border-color: color-mix(in srgb, var(--tc) 52%, transparent);
}

/* 嵌入背景：左缘透明渐变遮罩，右侧轻微溢出 */
.overview-media {
  margin-right: -48px;
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    rgba(0, 0, 0, 0.35) 12%,
    rgba(0, 0, 0, 0.82) 28%,
    black 44%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    rgba(0, 0, 0, 0.35) 12%,
    rgba(0, 0, 0, 0.82) 28%,
    black 44%
  );
}

.overview-media-img {
  aspect-ratio: 4 / 3;
}

.overview-media-glow {
  filter: blur(48px);
  z-index: 1;
}

.overview-media-scanline {
  background:
    linear-gradient(180deg, rgba(4, 13, 20, 0.22), transparent 18%, transparent 72%, rgba(4, 13, 20, 0.5)),
    radial-gradient(circle at 50% 108%, rgba(3, 11, 17, 0.45), transparent 55%);
}
</style>
