<script setup>
import { onKeyStroke, useDebounceFn } from '@vueuse/core';
import { useRouteStore } from '@/store';
import { useIsMobile } from '@/utils';
import SearchResult from './SearchResult.vue';
import SearchFooter from './SearchFooter.vue';

defineOptions({ name: 'SearchModal' });

const props = defineProps({
	/** 弹窗显隐 */
	value: Boolean
});

const emit = defineEmits(['update:value']);

const isMobile = useIsMobile();
const router = useRouter();
const routeStore = useRouteStore();

const keyword = ref('');
const activePath = ref('');
const resultOptions = shallowRef([]);
const inputRef = ref();

const handleSearch = useDebounceFn(search, 300);

const show = computed({
	get() {
		return props.value;
	},
	set(val) {
		emit('update:value', val);
	}
});

watch(show, async val => {
	if (val) {
		/** 自动聚焦 */
		await nextTick();
		inputRef.value?.focus();
	}
});

/** 查询 */
function search() {
	resultOptions.value = routeStore.searchMenus.filter(menu => {
		const trimKeyword = keyword.value.toLocaleLowerCase().trim();
		const title = menu.meta.title.toLocaleLowerCase();
		return trimKeyword && title.includes(trimKeyword);
	});
	activePath.value = resultOptions.value[0]?.path ?? '';
}

function handleClose() {
	show.value = false;
	/** 延时处理防止用户看到某些操作 */
	setTimeout(() => {
		resultOptions.value = [];
		keyword.value = '';
	}, 200);
}

/** key up */
function handleUp() {
	const { length } = resultOptions.value;
	if (length === 0) return;
	const index = resultOptions.value.findIndex(item => item.path === activePath.value);
	if (index === 0) {
		activePath.value = resultOptions.value[length - 1].path;
	} else {
		activePath.value = resultOptions.value[index - 1].path;
	}
}

/** key down */
function handleDown() {
	const { length } = resultOptions.value;
	if (length === 0) return;
	const index = resultOptions.value.findIndex(item => item.path === activePath.value);
	if (index + 1 === length) {
		activePath.value = resultOptions.value[0].path;
	} else {
		activePath.value = resultOptions.value[index + 1].path;
	}
}

/** key enter */
function handleEnter() {
	const { length } = resultOptions.value;
	if (length === 0 || activePath.value === '') return;
	const routeItem = resultOptions.value.find(item => item.path === activePath.value);
	if (routeItem?.meta?.href) {
		window.open(activePath.value, '__blank');
	} else {
		router.push(activePath.value);
		handleClose();
	}
}

onKeyStroke('Escape', handleClose);
onKeyStroke('Enter', handleEnter);
onKeyStroke('ArrowUp', handleUp);
onKeyStroke('ArrowDown', handleDown);
</script>

<template>
	<NModal
		v-model:show="show"
		:segmented="{ footer: 'soft' }"
		:closable="false"
		preset="card"
		footer-style="padding: 0; margin: 0"
		class="fixed left-0 right-0"
		:class="[isMobile ? 'size-full top-0px rounded-0' : 'w-630px top-50px']"
		@after-leave="handleClose"
	>
		<NInputGroup>
			<NInput ref="inputRef" v-model:value="keyword" clearable placeholder="请输入关键词搜索" @input="handleSearch">
				<template #prefix>
					<icon-uil-search class="text-15px text-#c2c2c2" />
				</template>
			</NInput>
			<NButton v-if="isMobile" type="primary" ghost @click="handleClose">取消</NButton>
		</NInputGroup>

		<div class="mt-20px">
			<NEmpty v-if="resultOptions.length === 0" description="暂无搜索结果" />
			<SearchResult v-else v-model:value="activePath" :options="resultOptions" @enter="handleEnter" />
		</div>
		<template #footer>
			<SearchFooter v-if="!isMobile" />
		</template>
	</NModal>
</template>

<style lang="scss" scoped></style>
