<script setup>
import { useTabStore } from '@/store';
import { useRouterPush } from '@/utils';

const { routerPush } = useRouterPush();
const tabStore = useTabStore();
const title = ref('');

function handleToTabDetail() {
	routerPush({ name: 'function_tab-detail', query: { name: 'abc' }, hash: '#DEMO_HASH' });
}

function handleToTabMultiDetail(num) {
	routerPush({ name: 'function_tab-multi-detail', query: { name: 'abc', num }, hash: '#DEMO_HASH' });
}

function handleSetTitle() {
	if (!title.value) {
		window.$message?.warning('请输入要设置的标题名称');
	} else {
		tabStore.setActiveTabTitle(title.value);
	}
}
</script>

<template>
	<NSpace :vertical="true" :size="16">
		<NCard title="Tab Home" :bordered="false" size="small" class="rounded-8px shadow-sm">
			<NSpace :vertical="true" :size="12">
				<NButton @click="handleToTabDetail">跳转Tab Detail</NButton>
				<NButton @click="handleToTabMultiDetail(1)">跳转Tab Multi Detail 1</NButton>
				<NButton @click="handleToTabMultiDetail(2)">跳转Tab Multi Detail 2</NButton>
				<NButton @click="handleToTabMultiDetail(3)">跳转Tab Multi Detail 3</NButton>
				<NButton @click="handleToTabMultiDetail(4)">跳转Tab Multi Detail 4</NButton>
				<NButton @click="handleToTabMultiDetail(5)">跳转Tab Multi Detail 5</NButton>
				<NButton @click="handleToTabMultiDetail(6)">跳转Tab Multi Detail 6</NButton>
				<NInputGroup>
					<NInput v-model:value="title" />
					<NButton type="primary" @click="handleSetTitle">设置当前Tab页标题</NButton>
				</NInputGroup>
			</NSpace>
		</NCard>
	</NSpace>
</template>

<style scoped></style>
