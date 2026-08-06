<script setup lang="ts">
import { useTemplateRef } from 'vue';

interface ScrollShowcaseItem {
  id: string;
  label: string;
  title: string;
  description?: string;
}

defineProps<{
  item: ScrollShowcaseItem;
  index: number;
}>();

const rootRef = useTemplateRef<HTMLElement>('rootRef');
const contentRef = useTemplateRef<HTMLElement>('contentRef');

defineExpose({
  getRoot: () => rootRef.value,
  getContent: () => contentRef.value
});
</script>

<template>
  <section
    :id="item.id"
    ref="rootRef"
    class="flex min-h-100vh items-center justify-center relative overflow-hidden"
  >
    <div
      ref="contentRef"
      class="border-y border-white/10 flex min-h-100vh items-center relative"
    >
      <slot :item="item" :index="index">
        <div class="flex gap-80px w-full items-center justify-between">
          <div>
            <p class="text-[clamp(72px,10vw,180px)] text-white/6 leading-none font-700 m-0 tabular-nums">
              {{ String(index + 1).padStart(2, '0') }}
            </p>
            <h2 class="text-[clamp(36px,5vw,82px)] text-white leading-[1.05] tracking-[-0.03em] font-600 m-0 mt-[-28px]">
              {{ item.title }}
            </h2>
            <p class="text-18px text-[#9fb2c8] leading-30px m-0 mt-24px max-w-560px">
              {{ item.description ?? 'Content placeholder' }}
            </p>
          </div>

          <div class="flex shrink-0 h-240px w-240px items-center justify-center relative" aria-hidden="true">
            <span class="border border-white/12 rounded-full h-full w-full absolute" />
            <span class="border border-[#27ff64]/35 rounded-full h-150px w-150px absolute" />
            <span class="rounded-full bg-[#27ff64] h-12px w-12px shadow-[0_8px_24px_rgba(39,255,100,0.28)]" />
          </div>
        </div>
      </slot>
    </div>
  </section>
</template>
