<script setup>
defineOptions({ name: 'ColorCheckbox' });

const props = defineProps({
	/** 颜色 */
	color: {
		type: String,
		default: ''
	},
	/** 是否选中 */
	checked: Boolean,
	/** 图标的class */
	iconClass: {
		type: String,
		default: 'text-14px'
	}
});

const whiteColors = ['#ffffff', '#fff', 'rgb(255,255,255)'];
const isWhite = computed(() => whiteColors.includes(props.color));
</script>

<template>
	<div class="h-20px w-20px flex-center cursor-pointer rounded-2px shadow" :style="{ backgroundColor: color }">
		<icon-ic-outline-check v-if="checked" :class="[iconClass, isWhite ? 'text-gray-700' : 'text-white']" />
	</div>
</template>

<style scoped></style>
