<script setup>
import { loginModuleEnum } from '@/constants';
import { useThemeStore } from '@/store';
import { getAppInfo, getColorPalette, mixColor } from '@/utils';
import { LoginBg, PwdLogin } from './components';

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
    value: loginModuleEnum.get('pwd-login').value,
    label: loginModuleEnum.get('pwd-login').label,
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

<template>
  <div class="flex-center size-full relative" :style="{ backgroundColor: bgColor }">
    <DarkModeSwitch
      :dark="theme.darkMode"
      class="text-20px left-48px top-24px absolute z-3"
      @update:dark="theme.setDarkMode"
    />
    <NCard :bordered="false" size="large" class="rounded-20px shadow-sm z-4 !w-auto">
      <div class="py-10px w-300px sm:w-360px">
        <header class="flex-y-center justify-between">
          <SystemLogo class="text-64px text-primary" />
          <NGradientText type="primary" :size="28">{{ title }}</NGradientText>
        </header>
        <main class="pt-24px">
          <h3 class="text-18px text-primary font-medium">
            {{ activeModule.label }}
          </h3>
          <div class="pt-24px">
            <Transition name="fade-slide" mode="out-in" appear>
              <component :is="activeModule.component" />
            </Transition>
          </div>
        </main>
      </div>
    </NCard>
    <LoginBg :theme-color="bgThemeColor" />
  </div>
</template>

<style scoped></style>
