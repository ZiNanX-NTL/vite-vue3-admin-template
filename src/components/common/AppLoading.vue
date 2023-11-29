<template>
  <div class="fixed-center flex-col">
    <!-- <system-logo class="text-128px text-primary" /> -->
    <div class="w-56px h-56px my-36px">
      <div class="relative h-full animate-spin">
        <div
          v-for="(item, index) in lodingClasses"
          :key="index"
          class="absolute w-16px h-16px bg-primary rounded-8px animate-pulse"
          :class="item"
        ></div>
      </div>
    </div>

    <h2 class="text-28px font-500 text-#646464">{{ loadingTitle }}</h2>
  </div>
</template>

<script setup>
import { getThemeSettings } from '@/settings';
import { localStg, getAppInfo } from '@/utils';

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

const lodingClasses = [
  'left-0 top-0',
  'left-0 bottom-0 animate-delay-500',
  'right-0 top-0 animate-delay-1000',
  'right-0 bottom-0 animate-delay-1500'
];

function addThemeColorCssVars() {
  const defaultColor = getThemeSettings().themeColor;
  const themeColor = localStg.get('themeColor') || defaultColor;

  const cssVars = `--primary-color: ${themeColor}`;
  document.documentElement.style.cssText = cssVars;
}

if (props.addThemeToBody) {
  addThemeColorCssVars();
}
</script>

<style scoped></style>
