<script setup>
import { getThemeSettings } from '@/settings';
import { getAppInfo, getRgbOfColor, sessionStg } from '@/utils';

const { title: appTitle } = getAppInfo();

defineOptions({ name: 'AppLoading' });

const props = defineProps({
  addThemeToBody: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: ''
  }
});

const loadingTitle = computed(() => props.title || appTitle);

const loadingClasses = [
  'left-0 top-0',
  'left-0 bottom-0 animate-delay-500',
  'right-0 top-0 animate-delay-1000',
  'right-0 bottom-0 animate-delay-1500'
];

function addThemeColorCssVars() {
  const defaultColor = getThemeSettings().themeColor;
  const themeColor = sessionStg.get('themeColor') || defaultColor;

  const { r, g, b } = getRgbOfColor(themeColor);

  const cssVars = `--primary-color: ${r} ${g} ${b}`;
  document.documentElement.style.cssText = cssVars;
}

if (props.addThemeToBody) {
  addThemeColorCssVars();
}
</script>

<template>
  <div class="fixed-center flex-vertical">
    <!-- <system-logo class="text-128px text-primary" /> -->
    <div class="my-36px h-56px w-56px">
      <div class="relative h-full animate-spin">
        <div
          v-for="(item, index) in loadingClasses"
          :key="index"
          class="absolute h-16px w-16px animate-pulse rounded-8px bg-primary"
          :class="item"
        ></div>
      </div>
    </div>

    <slot>
      <h2 class="text-28px text-#646464 font-500">{{ loadingTitle }}</h2>
    </slot>
  </div>
</template>

<style scoped></style>
