<script setup>
defineOptions({ name: 'SystemLogo' });

defineProps({
	fill: {
		type: Boolean,
		default: false
	}
});
</script>

<template>
	<icon-local-logo-fill v-if="fill" />
	<icon-local-logo v-else />
</template>

<style scoped></style>
