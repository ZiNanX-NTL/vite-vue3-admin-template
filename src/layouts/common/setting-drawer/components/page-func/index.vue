<script setup>
import { useThemeStore } from '@/store';
import SettingMenu from '../setting-menu/index.vue';

defineOptions({ name: 'PageFunc' });

const theme = useThemeStore();
</script>

<template>
	<NDivider title-placement="center">界面功能</NDivider>
	<NSpace vertical size="large">
		<SettingMenu label="滚动模式">
			<NSelect
				class="w-120px"
				size="small"
				:value="theme.scrollMode"
				:options="theme.scrollModeList"
				@update:value="theme.setScrollMode"
			/>
		</SettingMenu>
		<SettingMenu label="头部高度">
			<NInputNumber
				class="w-120px"
				size="small"
				:value="theme.header.height"
				:step="1"
				@update:value="theme.setHeaderHeight"
			/>
		</SettingMenu>
		<SettingMenu label="侧边栏展开宽度">
			<NInputNumber
				class="w-120px"
				size="small"
				:value="theme.sider.width"
				:step="10"
				@update:value="theme.setSiderWidth"
			/>
		</SettingMenu>
		<SettingMenu label="自定义logo宽度">
			<NSwitch :value="theme.logo.isCustomizeWidth" @update:value="theme.setIsCustomizeWidth" />
		</SettingMenu>
		<SettingMenu label="自定义logo宽度">
			<NInputNumber
				class="w-120px"
				size="small"
				:value="theme.logo.width"
				:step="1"
				@update:value="theme.setLogoWidth"
			/>
		</SettingMenu>
	</NSpace>
</template>

<style scoped></style>
