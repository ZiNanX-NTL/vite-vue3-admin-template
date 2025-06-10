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

<template>
  <NDropdown :options="options" @select="handleDropdown">
    <HoverContainer class="px-12px" :inverted="theme.header.inverted">
      <icon-local-avatar class="text-32px" />
      <span class="text-16px font-medium pl-8px">{{ auth.userInfo.userName }}</span>
    </HoverContainer>
  </NDropdown>
</template>

<style scoped></style>
