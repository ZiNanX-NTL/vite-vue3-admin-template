<script setup>
import { useThemeStore } from '@/store';
import { useBasicLayout } from '@/utils';
import SettingMenu from '../setting-menu/index.vue';
import { LayoutCard } from './components';

defineOptions({ name: 'LayoutMode' });

const theme = useThemeStore();
const { mode } = useBasicLayout();
</script>

<template>
	<NDivider title-placement="center">布局模式</NDivider>
	<NSpace justify="space-around" :wrap="true" :size="24" class="px-12px">
		<LayoutCard
			v-for="item in theme.layout.modeList"
			:key="item.value"
			:mode="item.value"
			:label="item.label"
			:checked="item.value === theme.layout.mode"
			@click="theme.setLayoutMode(item.value)"
		>
			<template v-if="item.value === 'vertical'">
				<div class="h-full w-18px rd-4px bg-primary:50"></div>
				<div class="flex-vertical flex-1 gap-6px">
					<div class="h-16px rd-4px bg-primary"></div>
					<div class="flex-1 rd-4px bg-primary:25"></div>
				</div>
			</template>
			<template v-if="item.value === 'horizontal'">
				<div class="h-16px rd-4px bg-primary"></div>
				<div class="flex flex-1 gap-6px">
					<div class="flex-1 rd-4px bg-primary:25"></div>
				</div>
			</template>
			<template v-if="item.value === 'vertical-mix'">
				<div class="h-16px rd-4px bg-primary"></div>
				<div class="flex flex-1 gap-6px">
					<div class="w-18px rd-4px bg-primary:50"></div>
					<div class="flex-1 rd-4px bg-primary:25"></div>
				</div>
			</template>
		</LayoutCard>
	</NSpace>
	<NSpace v-if="mode === 'vertical' || mode === 'vertical-mix'" vertical size="large" class="mt-12px">
		<SettingMenu label="菜单左上分离">
			<NSwitch :value="theme.layout.isMenuSeparation" @update:value="theme.setMenuSeparation" />
		</SettingMenu>
		<SettingMenu v-if="theme.layout.isMenuSeparation" label="菜单左上反转">
			<NSwitch :value="theme.layout.isMenuInverted" @update:value="theme.setMenuInverted" />
		</SettingMenu>
	</NSpace>
</template>

<style scoped>
.layout-card__shadow {
	box-shadow: 0 1px 2.5px rgba(0, 0, 0, 0.18);
}
</style>
