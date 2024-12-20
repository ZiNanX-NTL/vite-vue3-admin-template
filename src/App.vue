<script setup>
import { dateZhCN, zhCN } from 'naive-ui';
import { subscribeStore, useThemeStore } from '@/store';
import { useGlobalEvents } from './utils';

const theme = useThemeStore();

subscribeStore();
useGlobalEvents();
</script>

<template>
	<NConfigProvider
		:theme="theme.naiveTheme"
		:theme-overrides="theme.naiveThemeOverrides"
		:locale="zhCN"
		:date-locale="dateZhCN"
		class="h-full"
	>
		<NThemeEditor class="bottom-100px">
			<NaiveProvider>
				<RouterView />
			</NaiveProvider>
		</NThemeEditor>
	</NConfigProvider>
</template>

<style scoped lang="scss">
.n-config-provider {
	@apply h-full;
}
</style>
