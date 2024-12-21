<script setup>
import { useAppStore, useAuthStore } from '@/store';
import { useAuth, useLoading } from '@/hooks';

const appStore = useAppStore();
const authStore = useAuthStore();
const { hasAuth } = useAuth();
const { loading, startLoading, endLoading } = useLoading();

const accounts = computed(() => [
  {
    key: 'super',
    label: '超级管理员',
    userName: 'Super',
    password: 'super123'
  },
  {
    key: 'admin',
    label: '管理员',
    userName: 'Admin',
    password: 'admin123'
  },
  {
    key: 'user',
    label: '用户',
    userName: 'User01',
    password: 'user01123'
  }
]);

const loginAccount = ref('super');

async function handleToggleAccount(account) {
  loginAccount.value = account.key;

  startLoading();
  await authStore.login(account.userName, account.password, false);
  endLoading();
  appStore.reloadPage();
}
</script>

<template>
  <NSpace vertical :size="16">
    <NCard title="切换权限" :bordered="false" size="small" segmented class="card-wrapper">
      <NDescriptions bordered :column="1">
        <NDescriptionsItem label="用户角色">
          <NSpace>
            <NTag>{{ authStore.userInfo.userRole }}</NTag>
          </NSpace>
        </NDescriptionsItem>
        <NDescriptionsItem label="用户权限">
          <NSpace>
            <NTag>{{ authStore.userInfo.userPermissions }}</NTag>
          </NSpace>
        </NDescriptionsItem>
        <NDescriptionsItem ions-item label="切换账号">
          <NSpace>
            <NButton
              v-for="account in accounts"
              :key="account.key"
              :loading="loading && loginAccount === account.key"
              :disabled="loading && loginAccount !== account.key"
              @click="handleToggleAccount(account)"
            >
              {{ account.label }}
            </NButton>
          </NSpace>
        </NDescriptionsItem>
      </NDescriptions>
    </NCard>
    <NCard title="MAC权限钩子函数 `hasAuth`" :bordered="false" size="small" segmented class="card-wrapper">
      <NSpace>
        <NButton v-if="hasAuth(['super'])">超级管理员可见</NButton>
        <NButton v-if="hasAuth(['super', 'admin'])">管理员可见</NButton>
        <NButton v-if="hasAuth(['super', 'admin', 'user'])">用户可见</NButton>
      </NSpace>
    </NCard>
    <NCard title="RBAC权限钩子函数 `hasAuth`" :bordered="false" size="small" segmented class="card-wrapper">
      <NSpace>
        <NButton v-if="hasAuth('B_CODE1')">超级管理员可见</NButton>
        <NButton v-if="hasAuth('B_CODE2')">管理员可见</NButton>
        <NButton v-if="hasAuth('B_CODE3')">用户可见</NButton>
      </NSpace>
    </NCard>
  </NSpace>
</template>

<style scoped></style>
