<script setup lang="ts">
import { gsap } from 'gsap';
import { onUnmounted, provide, ref } from 'vue';
import { GlobalContent } from '../common';
import HeadBar from './components/HeadBar.vue';
import { bigScrollKey, createBigScroll } from './composables/useBigScroll';

defineOptions({ name: 'BigLayout' });

const headBarRef = ref();
const bigScroll = createBigScroll();
const isHeadBarHidden = ref(false);

provide(bigScrollKey, bigScroll);

function getHeadBarElement() {
  return headBarRef.value?.$el ?? headBarRef.value;
}

function setHeadBarVisible(visible: boolean) {
  const element = getHeadBarElement();
  if (!element || isHeadBarHidden.value === !visible) {
    return;
  }

  isHeadBarHidden.value = !visible;
  gsap.to(element, {
    yPercent: visible ? 0 : -100,
    duration: 0.35,
    ease: 'power2.out',
    overwrite: true
  });
}

const stopScrollListener = bigScroll.onScroll(({ direction, scroll }) => {
  if (scroll <= 0 || direction < 0) {
    setHeadBarVisible(true);
  } else if (direction > 0) {
    setHeadBarVisible(false);
  }
});

onUnmounted(() => {
  stopScrollListener();
  bigScroll.destroy();
  const element = getHeadBarElement();
  if (element) {
    gsap.killTweensOf(element);
    gsap.set(element, { yPercent: 0 });
  }
});
</script>

<template>
  <div class="basic-layout size-full relative overflow-hidden">
    <HeadBar ref="headBarRef" class="bg-transparent h-[75pw] w-full absolute z-10" />
    <GlobalContent class="" :show-padding="false" />
  </div>
</template>

<style scoped></style>
