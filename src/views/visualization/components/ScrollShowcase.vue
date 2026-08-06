<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import type { BigScrollEvent } from '@/layouts/big/composables/useBigScroll';
import { inject, nextTick, onBeforeUnmount, onMounted, ref, useSlots, useTemplateRef } from 'vue';
import LineSidebar from '@/components/vue-bits/LineSidebar.vue';
import { bigScrollKey } from '@/layouts/big/composables/useBigScroll';
import { gsap } from '@/plugins';
import ScrollShowcaseSection from './ScrollShowcaseSection.vue';

interface ScrollShowcaseItem {
  id: string;
  label: string;
  title: string;
  description?: string;
}

type ScrollShowcaseSectionInstance = ComponentPublicInstance & {
  getRoot: () => HTMLElement | null;
  getContent: () => HTMLElement | null;
};

defineProps<{
  items: ScrollShowcaseItem[];
  accentColor?: string;
}>();

const slots = useSlots();
const bigScroll = inject(bigScrollKey);
const rootRef = useTemplateRef<HTMLElement>('rootRef');
const sidebarRef = useTemplateRef<HTMLElement>('sidebarRef');
const sectionRefs = ref<(ScrollShowcaseSectionInstance | null)[]>([]);
const activeIndex = ref(0);

let sectionTimelines: gsap.core.Timeline[] = [];
let stopScrollListener: (() => void) | undefined;
let matchMedia: ReturnType<typeof gsap.matchMedia> | undefined;
let sidebarVisible = false;

function setSectionRef(instance: Element | ComponentPublicInstance | null, index: number) {
  sectionRefs.value[index] = instance as ScrollShowcaseSectionInstance | null;
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

  if (rootRect.top < viewportHeight && rootRect.bottom > 0 && activeIndex.value !== closestIndex)
    activeIndex.value = closestIndex;
}

function handleItemClick(index: number) {
  const section = sectionRefs.value[index]?.getRoot();
  if (section)
    bigScroll?.scrollTo(section, { duration: 1.1 });
}

onMounted(async () => {
  await nextTick();

  const root = rootRef.value;
  const sidebar = sidebarRef.value;
  const contents = sectionRefs.value
    .map(section => section?.getContent())
    .filter((content): content is HTMLElement => Boolean(content));

  if (!root || !sidebar || contents.length === 0)
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
        gsap.set(contents, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        return;
      }

      sectionTimelines = contents.map(content => gsap.timeline({ paused: true })
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
        }));

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
        :accent-color="accentColor"
        :item-gap="40"
        :default-active="0"
        @update:active-index="activeIndex = $event"
        @item-click="handleItemClick"
      />
    </aside>

    <ScrollShowcaseSection
      v-for="(item, index) in items"
      :key="item.id"
      :ref="instance => setSectionRef(instance, index)"
      :item="item"
      :index="index"
    >
      <template v-if="slots.section" #default="slotProps">
        <slot name="section" v-bind="slotProps" />
      </template>
    </ScrollShowcaseSection>
  </div>
</template>
