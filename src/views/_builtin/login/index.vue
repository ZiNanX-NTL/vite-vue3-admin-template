<template>
  <div class="relative size-full flex-center" :style="{ backgroundColor: bgColor }">
    <dark-mode-switch
      :dark="theme.darkMode"
      class="absolute left-48px top-24px z-3 text-20px"
      @update:dark="theme.setDarkMode"
    />
    <n-card :bordered="false" size="large" class="z-4 rounded-20px shadow-sm !w-auto">
      <div class="w-300px py-10px sm:w-360px">
        <header class="flex-y-center justify-between">
          <system-logo class="text-64px text-primary" />
          <n-gradient-text type="primary" :size="28">{{ title }}</n-gradient-text>
        </header>
        <main class="pt-24px">
          <h3 class="text-18px text-primary font-medium">
            {{ activeModule.label }}
          </h3>
          <div class="pt-24px">
            <transition name="fade-slide" mode="out-in" appear>
              <component :is="activeModule.component" />
            </transition>
          </div>
        </main>
      </div>
    </n-card>
    <login-bg :theme-color="bgThemeColor" />
  </div>
</template>

<script setup>
import { loginModuleEnum } from '@/constants';
import { useThemeStore } from '@/store';
import { getAppInfo, getColorPalette, mixColor } from '@/utils';
import { PwdLogin, LoginBg } from './components';

const props = defineProps({
  module: {
    validator(value) {
      return loginModuleEnum.keys.includes(value);
    },
    required: true
  }
});

const theme = useThemeStore();
const { title } = getAppInfo();

const modules = [
  {
    value: loginModuleEnum['pwd-login'].value,
    label: loginModuleEnum['pwd-login'].label,
    component: PwdLogin
  }
];

const activeModule = computed(() => {
  const active = { ...modules[0] };
  const findItem = modules.find(item => item.value === props.module);
  if (findItem) {
    Object.assign(active, findItem);
  }
  return active;
});

const bgThemeColor = computed(() => (theme.darkMode ? getColorPalette(theme.themeColor, 7) : theme.themeColor));

const bgColor = computed(() => {
  const COLOR_WHITE = '#ffffff';
  const ratio = theme.darkMode ? 0.5 : 0.2;
  return mixColor(COLOR_WHITE, theme.themeColor, ratio);
});
</script>

<style scoped></style>
