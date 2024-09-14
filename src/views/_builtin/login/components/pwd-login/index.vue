<template>
  <n-form ref="formRef" :model="model" :rules="rules" size="large" :show-label="false">
    <n-form-item path="userName">
      <n-input v-model:value="model.userName" placeholder="请输入用户名" />
    </n-form-item>
    <n-form-item path="password">
      <n-input v-model:value="model.password" type="password" show-password-on="click" placeholder="请输入密码" />
    </n-form-item>
    <n-space :vertical="true" :size="24" class="pt-20px">
      <n-button
        type="primary"
        size="large"
        :block="true"
        :round="true"
        :loading="auth.loginLoading"
        @click="handleSubmit"
      >
        确定
      </n-button>
      <div class="flex-y-center justify-between">
        <n-checkbox v-model:checked="remember.rememberMe">记住我</n-checkbox>
        <n-button :text="true" @click="toLoginModule('reset-pwd')">忘记密码？</n-button>
      </div>
    </n-space>
  </n-form>
</template>

<script setup lang="ts">
import { useAuthStore, useRememberStore } from '@/store';
import { useFormRules } from '@/hooks';
import { useRouterPush } from '@/utils';

const auth = useAuthStore();
const { login } = useAuthStore();
const remember = useRememberStore();
const { setAccount, clearAccount } = useRememberStore();
const { toLoginModule } = useRouterPush();

const formRef = ref();

const model = reactive({
  userName: 'Soybean',
  password: 'soybean123'
});

const { formRules } = useFormRules();
const rules = {
  password: formRules.pwd
};

/** clear account */
watchEffect(() => {
  if (!remember.rememberMe) {
    clearAccount();
  }
});

/** check remember */
function initModel() {
  if (!remember.rememberMe) return;
  model.userName = remember.userName;
  model.password = remember.password;
}
initModel();

async function handleSubmit() {
  await formRef.value?.validate();

  const { userName, password } = model;

  await login(userName, password);

  if (remember.rememberMe) {
    setAccount(userName, password);
  } else {
    clearAccount();
  }
}
</script>

<style scoped></style>
