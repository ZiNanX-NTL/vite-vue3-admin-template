<script setup lang="ts">
import type { ComponentPublicInstance, CSSProperties } from 'vue';
import { computed, onUnmounted, ref, watch } from 'vue';

export type Falloff = 'linear' | 'smooth' | 'sharp';

interface LineSidebarProps {
  items?: string[];
  accentColor?: string;
  textColor?: string;
  markerColor?: string;
  showIndex?: boolean;
  showMarker?: boolean;
  proximityRadius?: number;
  maxShift?: number;
  falloff?: Falloff;
  markerLength?: number;
  markerGap?: number;
  tickScale?: number;
  scaleTick?: boolean;
  itemGap?: number;
  fontSize?: number;
  smoothing?: number;
  activeIndex?: number | null;
  defaultActive?: number | null;
}

const props = withDefaults(defineProps<LineSidebarProps>(), {
  items: () => [
    'Overview',
    'Components',
    'Animations',
    'Backgrounds',
    'Showcase',
    'Playground',
    'Templates',
    'Changelog',
    'Community',
    'Resources',
    'Documentation',
    'Support'
  ],
  accentColor: '#A855F7',
  textColor: '#c4c4c4',
  markerColor: '#6c6c6c',
  showIndex: true,
  showMarker: true,
  proximityRadius: 100,
  maxShift: 30,
  falloff: 'smooth',
  markerLength: 60,
  markerGap: 0,
  tickScale: 0.5,
  scaleTick: true,
  itemGap: 20,
  fontSize: 1.1,
  smoothing: 100,
  defaultActive: null
});

const emit = defineEmits<{
  'itemClick': [index: number, label: string];
  'update:activeIndex': [index: number];
}>();

const FALLOFF_CURVES: Record<Falloff, (p: number) => number> = {
  linear: p => p,
  smooth: p => p * p * (3 - 2 * p),
  sharp: p => p * p * p
};

const listRef = ref<HTMLUListElement | null>(null);
const itemRefs = ref<(HTMLLIElement | null)[]>([]);
let targets: number[] = [];
const current: number[] = [];
let rafId: number | null = null;
let last = 0;

const internalActiveIndex = ref<number | null>(props.defaultActive);
const resolvedActiveIndex = computed(() => props.activeIndex === undefined ? internalActiveIndex.value : props.activeIndex);

function setItemRef(el: Element | ComponentPublicInstance | null, index: number) {
  itemRefs.value[index] = el as HTMLLIElement | null;
}

function runFrame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const tau = Math.max(props.smoothing, 1) / 1000;
  const k = 1 - Math.exp(-dt / tau);

  let moving = false;
  const els = itemRefs.value;
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    if (!el)
      continue;
    const target = Math.max(targets[i] || 0, resolvedActiveIndex.value === i ? 1 : 0);
    const cur = current[i] || 0;
    const next = cur + (target - cur) * k;
    const settled = Math.abs(target - next) < 0.0015;
    const value = settled ? target : next;
    current[i] = value;
    el.style.setProperty('--effect', value.toFixed(4));
    el.style.setProperty('--effect-shift', `${(value * props.maxShift).toFixed(2)}px`);
    if (!settled)
      moving = true;
  }

  rafId = moving ? requestAnimationFrame(runFrame) : null;
}

function startLoop() {
  if (rafId != null)
    return;
  last = performance.now();
  rafId = requestAnimationFrame(runFrame);
}

function handlePointerMove(e: PointerEvent) {
  const list = listRef.value;
  if (!list)
    return;
  const rect = list.getBoundingClientRect();
  const pointerY = e.clientY - rect.top;
  const ease = FALLOFF_CURVES[props.falloff] ?? FALLOFF_CURVES.linear;
  const els = itemRefs.value;
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    if (!el)
      continue;
    const center = el.offsetTop + el.offsetHeight / 2;
    const distance = Math.abs(pointerY - center);
    targets[i] = ease(Math.max(0, 1 - distance / props.proximityRadius));
  }
  startLoop();
}

function handlePointerLeave() {
  targets = targets.map(() => 0);
  startLoop();
}

function handleClick(index: number, label: string) {
  internalActiveIndex.value = index;
  emit('update:activeIndex', index);
  emit('itemClick', index, label);
}

function tickClass(): string {
  return props.showMarker
    ? `after:absolute after:left-[calc(-1*var(--marker-length)-var(--marker-gap))] after:top-[calc(100%+var(--item-gap)/2)] after:h-px after:opacity-50 after:content-[''] last:after:content-none after:[background-color:var(--marker-color)] after:[width:calc(var(--marker-length)*var(--tick-scale))] ${
      props.scaleTick
        ? 'after:origin-left after:[transform:translateY(-50%)_scaleX(calc(0.7+var(--effect,0)*0.6))]'
        : 'after:-translate-y-1/2'
    }`
    : '';
}

watch(resolvedActiveIndex, () => startLoop(), { immediate: true });

onUnmounted(() => {
  if (rafId != null)
    cancelAnimationFrame(rafId);
});
</script>

<template>
  <nav
    class="flex justify-start relative"
    :class="{ 'pl-[calc(var(--marker-length)+var(--marker-gap))]': showMarker }"
    :style="
      {
        '--accent-color': accentColor,
        '--text-color': textColor,
        '--marker-color': markerColor,
        '--marker-length': `${markerLength}px`,
        '--marker-gap': `${markerGap}px`,
        '--tick-scale': tickScale,
        '--item-gap': `${itemGap}px`,
        '--font-size': `${fontSize}rem`,
        '--smoothing': `${smoothing}ms`,
      } as CSSProperties
    "
  >
    <ul
      ref="listRef"
      class="m-0 py-4 list-none flex flex-col gap-(--item-gap)"
      @pointermove="handlePointerMove"
      @pointerleave="handlePointerLeave"
    >
      <li
        v-for="(label, index) in items"
        :key="`${label}-${index}`"
        :ref="el => setItemRef(el, index)"
        :aria-current="resolvedActiveIndex === index ? 'true' : undefined"
        class="cursor-pointer relative before:content-[''] before:absolute before:-inset-x-12 before:-inset-y-1.5"
        :class="tickClass()"
        @click="handleClick(index, label)"
      >
        <span
          v-if="showMarker"
          aria-hidden="true"
          class="bg-[color-mix(in_srgb,var(--accent-color)_calc(var(--effect,0)*100%),var(--marker-color))] h-px w-(--marker-length) origin-left [transform:translateY(-50%)_scaleX(calc(0.7+var(--effect,0)*0.5))] left-[calc(-1*var(--marker-length)-var(--marker-gap))] top-1/2 absolute"
        />
        <span
          class="text-[color-mix(in_srgb,var(--accent-color)_calc(var(--effect,0)*100%),var(--text-color))] leading-[1.2] inline-flex [font-size:var(--font-size)] [transform:translateX(var(--effect-shift,0px))] items-baseline relative"
        >
          <span v-if="showIndex" class="text-[0.85em] font-mono mr-[0.6rem] opacity-[calc(0.55+var(--effect,0)*0.45)]">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <span>{{ label }}</span>
        </span>
      </li>
    </ul>
  </nav>
</template>
