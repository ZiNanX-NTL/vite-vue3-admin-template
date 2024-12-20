<script setup>
defineOptions({ name: 'DarkModeContainer' });

defineProps({
	inverted: {
		type: Boolean,
		default: false
	}
});
</script>

<template>
	<div class="transition-all dark:text-white dark:text-opacity-82" :class="inverted ? 'text-white' : 'text-#333639'">
		<slot></slot>
	</div>
</template>

<style scoped></style>
