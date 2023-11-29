<template>
  <n-dropdown :options="options" @select="handleDropdown">
    <hover-container class="px-12px" :inverted="theme.header.inverted">
      <icon-local-avatar class="text-32px" />
      <span class="pl-8px text-16px font-medium">{{ auth.userInfo.userName }}</span>
    </hover-container>
  </n-dropdown>
</template>

<script setup>
import { useAuthStore, useThemeStore } from '@/store';
import { useIconRender } from '@/utils';

defineOptions({ name: 'UserAvatar' });

const auth = useAuthStore();
const theme = useThemeStore();
const { iconRender } = useIconRender();

const options = [
  {
    label: '用户中心',
    key: 'user-center',
    icon: iconRender({ icon: 'carbon:user-avatar' })
  },
  {
    type: 'divider',
    key: 'divider'
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: iconRender({ icon: 'carbon:logout' })
  }
];

function handleDropdown(optionKey) {
  const key = optionKey;
  if (key === 'logout') {
    window.$dialog?.info({
      title: '提示',
      content: '您确定要退出登录吗？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        auth.resetAuthStore();
      }
    });
  }
}
</script>

<style scoped></style>
