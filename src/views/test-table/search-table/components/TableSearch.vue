<template>
  <n-card title="搜索" :bordered="false" size="small" class="card-wrapper">
    <n-form ref="formRef" :model="model" :rules="rules" label-placement="left">
      <n-grid cols="1 s:2 m:5" :x-gap="24" responsive="screen" item-responsive :collapsed="collapsed">
        <n-form-item-gi label="用户名" path="userName">
          <n-input v-model:value="model.userName" placeholder="请输入用户名" />
        </n-form-item-gi>
        <n-form-item-gi label="邮箱" path="email">
          <n-input v-model:value="model.email" placeholder="请输入邮箱" />
        </n-form-item-gi>
        <n-form-item-gi label="手机号码" path="phone">
          <n-input v-model:value="model.phone" placeholder="请输入手机号码" />
        </n-form-item-gi>
        <n-form-item-gi label="用户年龄" path="age">
          <n-input-number v-model:value="model.age" class="w-full" :precision="0" placeholder="请输入年龄" />
        </n-form-item-gi>
        <n-form-item-gi label="性别" path="gender">
          <n-select v-model:value="model.gender" placeholder="请选择性别" :options="genderEnum.values" clearable />
        </n-form-item-gi>
        <n-form-item-gi label="用户状态" path="userStatus">
          <NSelect
            v-model:value="model.userStatus"
            placeholder="请选择用户状态"
            :options="userStatusEnum.values"
            clearable
          />
        </n-form-item-gi>
        <n-gi suffix :show-feedback="false" #="{ overflow }">
          <n-space class="w-full" justify="end">
            <n-button @click="reset">
              <template #icon>
                <icon-ic-round-refresh class="text-icon" />
              </template>
              重置
            </n-button>
            <n-button type="primary" ghost @click="search">
              <template #icon>
                <icon-ic-round-search class="text-icon" />
              </template>
              搜索
            </n-button>
            <n-button circle ghost @click="collapsed = !collapsed">
              <template #icon>
                <icon-ep-arrow-up-bold v-if="!overflow" class="text-icon" />
                <icon-ep-arrow-down-bold v-else class="text-icon" />
              </template>
            </n-button>
          </n-space>
        </n-gi>
      </n-grid>
    </n-form>
  </n-card>
</template>

<script setup>
import { userStatusEnum, genderEnum } from '@/constants';
import { useFormRules, useNaiveForm } from '@/hooks';

defineOptions({
  name: 'TableSearch'
});

const emit = defineEmits(['reset', 'search']);

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel('model', { required: true });

const collapsed = ref(false);

const rules = computed(() => {
  const { patternRules } = useFormRules(); // inside computed to make locale reactive

  return {
    email: patternRules.email,
    phone: patternRules.phone
  };
});

async function reset() {
  await restoreValidation();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}
</script>

<style scoped></style>
