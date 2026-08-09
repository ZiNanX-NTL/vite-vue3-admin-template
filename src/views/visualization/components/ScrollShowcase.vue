<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import type { ScrollShowcaseChangeSource, ScrollShowcaseItem } from '../types';
import type { BigScrollEvent } from '@/layouts/big/composables/useBigScroll';
import { inject, nextTick, onBeforeUnmount, onMounted, ref, useSlots, useTemplateRef } from 'vue';
import LineSidebar from '@/components/vue-bits/LineSidebar.vue';
import { bigScrollKey } from '@/layouts/big/composables/useBigScroll';
import { gsap } from '@/plugins';
import { useThemeStore } from '@/store';
import ScrollShowcaseSection from './ScrollShowcaseSection.vue';

type ScrollShowcaseSectionInstance = ComponentPublicInstance & {
  getRoot: () => HTMLElement | null;
  getContent: () => HTMLElement | null;
};

const props = defineProps<{
  items: ScrollShowcaseItem[];
}>();

const emit = defineEmits<{
  activeSectionChange: [
    item: ScrollShowcaseItem | null,
    index: number | null,
    source: ScrollShowcaseChangeSource
  ];
}>();

const slots = useSlots();
const themeStore = useThemeStore();
const bigScroll = inject(bigScrollKey);
const rootRef = useTemplateRef<HTMLElement>('rootRef');
const sidebarRef = useTemplateRef<HTMLElement>('sidebarRef');
const sectionRefs = ref<(ScrollShowcaseSectionInstance | null)[]>([]);
const activeIndex = ref(0);

// Allow null so standalone sections keep the index aligned with sectionRefs.
let sectionTimelines: (gsap.core.Timeline | null)[] = [];
let stopScrollListener: (() => void) | undefined;
let matchMedia: ReturnType<typeof gsap.matchMedia> | undefined;
let sidebarVisible = false;
let lastEmittedIndex: number | null | undefined;

function setSectionRef(instance: Element | ComponentPublicInstance | null, index: number) {
  sectionRefs.value[index] = instance as ScrollShowcaseSectionInstance | null;
}

function getSections() {
  return sectionRefs.value.map(section => section?.getRoot() ?? null);
}

function setSidebarVisible(visible: boolean) {
  const sidebar = sidebarRef.value;
  if (!sidebar || sidebarVisible === visible)
    return;

  sidebarVisible = visible;
  gsap.to(sidebar, {
    autoAlpha: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
    duration: 0.25,
    ease: 'power2.out',
    overwrite: 'auto'
  });
}

function emitActiveSection(index: number | null, source: ScrollShowcaseChangeSource = 'scroll') {
  if (lastEmittedIndex === index)
    return;

  lastEmittedIndex = index;
  emit('activeSectionChange', index === null ? null : props.items[index] ?? null, index, source);
}

function handleScroll(_event?: BigScrollEvent) {
  const root = rootRef.value;
  const sections = sectionRefs.value
    .map(section => section?.getRoot())
    .filter((section): section is HTMLElement => Boolean(section));

  if (!root || sections.length === 0)
    return;

  const viewportHeight = window.innerHeight;
  const rootRect = root.getBoundingClientRect();
  const sectionRects = sections.map(section => section.getBoundingClientRect());
  const earthViewActivationLine = 0;

  setSidebarVisible(rootRect.top <= 0 && rootRect.bottom > 0);

  let closestIndex = activeIndex.value;
  let closestDistance = Number.POSITIVE_INFINITY;

  sectionRects.forEach((rect, index) => {
    const progress = gsap.utils.clamp(0, 1, (viewportHeight - rect.top) / (viewportHeight + rect.height));
    sectionTimelines[index]?.progress(progress);

    const distance = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  if (rootRect.top > earthViewActivationLine) {
    emitActiveSection(null);
    return;
  }

  if (rootRect.top < viewportHeight && rootRect.bottom > 0) {
    if (activeIndex.value !== closestIndex)
      activeIndex.value = closestIndex;

    emitActiveSection(closestIndex);
  }
}

function handleItemClick(index: number) {
  activeIndex.value = index;
  emitActiveSection(index, 'navigation');
  const section = sectionRefs.value[index]?.getRoot();
  if (section)
    bigScroll?.scrollTo(section, { duration: 1.1 });
}

function handleActiveIndexUpdate(index: number) {
  activeIndex.value = index;
  emitActiveSection(index, 'navigation');
}

onMounted(async () => {
  await nextTick();

  const root = rootRef.value;
  const sidebar = sidebarRef.value;

  // Collect contents per-index; standalone sections return null and are skipped
  // in animation setup but keep the array index aligned with sectionRefs.
  const allContents = sectionRefs.value.map(section => section?.getContent() ?? null);
  const animatedContents = allContents.filter((c): c is HTMLElement => c !== null);

  if (!root || !sidebar || animatedContents.length === 0)
    return;

  gsap.set(sidebar, { autoAlpha: 0, pointerEvents: 'none' });

  matchMedia = gsap.matchMedia();
  matchMedia.add(
    {
      allowMotion: '(prefers-reduced-motion: no-preference)',
      reduceMotion: '(prefers-reduced-motion: reduce)'
    },
    context => {
      sectionTimelines = [];

      if (context.conditions?.reduceMotion) {
        gsap.set(animatedContents, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        return;
      }

      // Build index-aligned timelines: null for standalone sections so that
      // handleScroll's sectionTimelines[index]?.progress() skips them cleanly.
      sectionTimelines = allContents.map(content => {
        if (!content)
          return null;

        return gsap.timeline({ paused: true })
          .fromTo(content, {
            autoAlpha: 0.15,
            y: 80,
            scale: 0.96,
            transformOrigin: '50% 50%'
          }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'none'
          })
          .to(content, {
            autoAlpha: 0.15,
            y: -80,
            scale: 0.96,
            duration: 0.5,
            ease: 'none'
          });
      });

      requestAnimationFrame(() => handleScroll());
    },
    root
  );

  stopScrollListener = bigScroll?.onScroll(handleScroll);
  handleScroll();
});

onBeforeUnmount(() => {
  stopScrollListener?.();
  matchMedia?.revert();
  if (sidebarRef.value)
    gsap.killTweensOf(sidebarRef.value);
  sectionTimelines = [];
});

defineExpose({
  getSections
});
</script>

<template>
  <div ref="rootRef" class="relative">
    <aside
      ref="sidebarRef"
      class="left-100px top-[calc(75pw+32px)] fixed z-20"
      aria-label="Showcase navigation"
    >
      <LineSidebar
        :items="items.map(item => item.label)"
        :active-index="activeIndex"
        :accent-color="themeStore.colorScheme[0]"
        :item-gap="40"
        :default-active="0"
        @update:active-index="handleActiveIndexUpdate"
        @item-click="handleItemClick"
      />
    </aside>

    <ScrollShowcaseSection
      v-for="(item, index) in items"
      :key="item.id"
      :ref="instance => setSectionRef(instance, index)"
      :item="item"
      :index="index"
      :standalone="item.standalone"
    >
      <template v-if="slots.section" #default="slotProps">
        <slot name="section" v-bind="slotProps" />
      </template>
    </ScrollShowcaseSection>
  </div>
</template>
