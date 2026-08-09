<script setup lang="ts">
import { gsap } from 'gsap';
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { bigScrollKey } from '@/layouts/big/composables/useBigScroll';
import { useThemeStore } from '@/store';

const MAP_URL = 'https://www.whqdxz.com:8081/dy/file/QDXZ/img/tupian.png';

const stats = [
  { value: '28+', label: '省份覆盖' },
  { value: '200+', label: '服务城市' },
  { value: '800+', label: '县级站点' },
  { value: '500万+', label: '服务农户' }
];

const themeStore = useThemeStore();
const themeColor = computed(() => themeStore.colorScheme[0]);
const bigScroll = inject(bigScrollKey);

const sectionRef = ref<HTMLElement | null>(null);
const headingRef = ref<HTMLElement | null>(null);
const descRef = ref<HTMLElement | null>(null);
const statsRef = ref<HTMLElement | null>(null);
const mapRef = ref<HTMLElement | null>(null);

let triggers: ScrollTrigger[] = [];

onMounted(() => {
  requestAnimationFrame(() => {
    const scroller = bigScroll?.scroller;
    const scrollerVars = scroller ? { scroller } : {};

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 70%',
        end: 'top 30%',
        scrub: 0.9,
        ...scrollerVars
      }
    });

    tl.fromTo(headingRef.value, { clipPath: 'inset(100% 0% 0% 0%)', y: 28 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'power3.out' }, 0);
    tl.fromTo(descRef.value, { clipPath: 'inset(100% 0% 0% 0%)', y: 18 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, ease: 'power3.out' }, 0.13);
    tl.fromTo(statsRef.value, { x: -30, opacity: 0 }, { x: 0, opacity: 1, ease: 'power2.out' }, 0.25);

    if (tl.scrollTrigger)
      triggers.push(tl.scrollTrigger);

    const mapAnim = gsap.fromTo(
      mapRef.value,
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

    if (mapAnim.scrollTrigger)
      triggers.push(mapAnim.scrollTrigger);
  });
});

onUnmounted(() => {
  triggers.forEach(t => t.kill());
  triggers = [];
  gsap.killTweensOf([headingRef.value, descRef.value, statsRef.value, mapRef.value].filter(Boolean));
});
</script>

<template>
  <section ref="sectionRef" class="layout-section text-white relative" aria-labelledby="layout-title">
    <!-- 为真实地球背景提供局部阅读遮罩与点阵层次 -->
    <!-- <div class="pointer-events-none inset-0 absolute" aria-hidden="true">
      <div class="layout-bg-readability" :style="{ '--tc': themeColor }" />
      <div class="layout-bg-dots" />
    </div> -->

    <div class="gap-x-0 gap-y-40px grid items-center relative z-1 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)]">
      <!-- 左侧：标题 + 数据 -->
      <div>
        <div ref="headingRef" class="overflow-hidden">
          <h1
            id="layout-title"
            class="text-[clamp(52px,7.5vw,88px)] text-white leading-[0.92] tracking-[-0.03em] font-900 m-0"
          >
            经营分布
          </h1>
        </div>

        <div ref="descRef" class="mt-22px overflow-hidden">
          <p class="text-[clamp(14px,1.5vw,18px)] text-white/52 leading-[1.65] tracking-[0.005em] m-0">
            持续完善全国布局<br>形成覆盖全国的农业服务网络
          </p>
        </div>

        <div ref="statsRef" class="mt-36px gap-x-14px gap-y-14px grid grid-cols-2">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="layout-stat"
            :style="{ '--tc': themeColor }"
          >
            <span class="layout-stat-value text-[clamp(22px,2.8vw,36px)] leading-none font-700 block">
              {{ stat.value }}
            </span>
            <span class="text-11px text-white/45 tracking-[0.1em] mt-6px block uppercase">
              {{ stat.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 内容侧阅读遮罩：不再模拟第二个地球 */
.layout-bg-readability {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgb(4 13 20 / 0.72), rgb(4 13 20 / 0.24) 48%, transparent 76%),
    radial-gradient(ellipse 42% 58% at 18% 48%, color-mix(in srgb, var(--tc) 5%, transparent), transparent 68%);
}

/* 保留轻量点阵作为数据层装饰 */
.layout-bg-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(109, 150, 204, 0.12) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 85% 75% at 72% 55%, black 25%, transparent 72%);
  -webkit-mask-image: radial-gradient(ellipse 85% 75% at 72% 55%, black 25%, transparent 72%);
}

.layout-stat {
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--tc) 22%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--tc) 5%, rgb(0 0 0 / 0.2));
  backdrop-filter: blur(8px);
  transition: border-color 0.25s, background 0.25s;
}

.layout-stat:hover {
  border-color: color-mix(in srgb, var(--tc) 42%, transparent);
  background: color-mix(in srgb, var(--tc) 10%, rgb(0 0 0 / 0.2));
}

.layout-stat-value {
  color: color-mix(in srgb, var(--tc) 80%, white);
  text-shadow: 0 0 20px color-mix(in srgb, var(--tc) 50%, transparent);
}

/* 地图容器：右侧出血 + 左侧渐入遮罩 */
.layout-map {
  margin-right: -48px;
  mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 8%, rgba(0,0,0,0.85) 22%, black 38%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 8%, rgba(0,0,0,0.85) 22%, black 38%);
}

.layout-map-img {
  aspect-ratio: 4 / 3;
  object-fit: contain;
  object-position: center;
  mix-blend-mode: screen;
  filter: brightness(1.15) saturate(1.3) drop-shadow(0 0 32px #00dfff40);
}

.layout-map-glow {
  filter: blur(60px);
  z-index: 1;
}

.layout-map-overlay {
  background:
    linear-gradient(to right, rgb(4 13 20 / 0.5) 0%, transparent 26%, transparent 68%, rgb(4 13 20 / 0.3) 100%),
    linear-gradient(180deg, rgb(4 13 20 / 0.2), transparent 15%, transparent 74%, rgb(4 13 20 / 0.45));
}

@keyframes scan-move {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

.layout-map-scan {
  background: linear-gradient(180deg, transparent 42%, rgba(255,255,255,0.035) 50%, transparent 58%);
  animation: scan-move 4.5s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .layout-map-scan {
    animation: none;
  }
}
</style>
