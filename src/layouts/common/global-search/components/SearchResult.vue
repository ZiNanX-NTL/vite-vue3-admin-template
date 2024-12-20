<script setup>
import { useThemeStore } from '@/store';

defineOptions({ name: 'SearchResult' });

const props = defineProps({
	value: {
		type: String,
		required: true
	},
	options: {
		type: Array,
		required: true
	}
});

const emit = defineEmits(['update:value', 'enter']);

const theme = useThemeStore();

const active = computed({
	get() {
		return props.value;
	},
	set(val) {
		emit('update:value', val);
	}
});

/** 鼠标移入 */
async function handleMouse(item) {
	active.value = item.path;
}

function handleTo() {
	emit('enter');
}
</script>

<template>
	<NScrollbar>
		<div class="pb-12px">
			<template v-for="item in options" :key="item.path">
				<div
					class="mt-8px h-56px flex-y-center cursor-pointer justify-between rounded-4px bg-#e5e7eb px-14px dark:bg-dark"
					:style="{
						background: item.path === active ? theme.themeColor : '',
						color: item.path === active ? '#fff' : ''
					}"
					@click="handleTo"
					@mouseenter="handleMouse(item)"
				>
					<SvgIcon :icon="item.meta.icon" :local-icon="item.meta.localIcon" />
					<span class="ml-5px flex-1">
						{{ item.meta?.title }}
					</span>
					<icon-ant-design-enter-outlined class="icon mr-3px p-2px text-20px" />
				</div>
			</template>
		</div>
	</NScrollbar>
</template>

<style lang="scss" scoped></style>
