<script setup>
import { useThemeStore } from '@/store';
import SettingMenu from '../setting-menu/index.vue';

defineOptions({ name: 'DarkMode' });

const theme = useThemeStore();
</script>

<template>
	<NDivider title-placement="center">主题模式</NDivider>
	<NSpace vertical size="large">
		<SettingMenu label="深色主题">
			<NSwitch :value="theme.darkMode" @update:value="theme.setDarkMode">
				<template #checked>
					<icon-mdi-white-balance-sunny class="text-14px text-white" />
				</template>
				<template #unchecked>
					<icon-mdi-moon-waning-crescent class="text-14px text-white" />
				</template>
			</NSwitch>
		</SettingMenu>
		<SettingMenu label="跟随系统">
			<NSwitch :value="theme.followSystemTheme" @update:value="theme.setFollowSystemTheme">
				<template #checked>
					<icon-ic-baseline-do-not-disturb class="text-14px text-white" />
				</template>
				<template #unchecked>
					<icon-ic-round-hdr-auto class="text-14px text-white" />
				</template>
			</NSwitch>
		</SettingMenu>
		<SettingMenu label="侧边栏深色">
			<NSwitch :value="theme.sider.inverted" @update:value="theme.setSiderInverted" />
		</SettingMenu>
		<SettingMenu label="头部深色">
			<NSwitch :value="theme.header.inverted" @update:value="theme.setHeaderInverted" />
		</SettingMenu>
	</NSpace>
</template>

<style scoped></style>
