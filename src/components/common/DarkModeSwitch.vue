<script setup>
defineOptions({ name: 'DarkModeSwitch' });

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:dark']);

const darkMode = computed({
  get() {
    return props.dark;
  },
  set(newValue) {
    emit('update:dark', newValue);
  }
});

async function handleSwitch() {
  darkMode.value = !darkMode.value;
}
</script>

<template>
  <div class="text-18px flex-center cursor-pointer" @click="handleSwitch">
    <icon-mdi-moon-waning-crescent v-if="darkMode" />
    <icon-mdi-white-balance-sunny v-else />
  </div>
</template>

<style></style>
