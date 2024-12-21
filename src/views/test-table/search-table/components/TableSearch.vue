<script setup>
import { genderEnum, userStatusEnum } from '@/constants';
import { useFormRules, useNaiveForm } from '@/hooks';

defineOptions({
  name: 'TableSearch'
});

const emit = defineEmits(['reset', 'search']);

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel('model', { type: Object, required: true });

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

<template>
  <NCard title="搜索" :bordered="false" size="small" class="card-wrapper">
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left">
      <NGrid cols="1 s:2 m:5" :x-gap="24" responsive="screen" item-responsive :collapsed="collapsed">
        <NFormItemGi label="用户名" path="userName">
          <NInput v-model:value="model.userName" placeholder="请输入用户名" />
        </NFormItemGi>
        <NFormItemGi label="邮箱" path="email">
          <NInput v-model:value="model.email" placeholder="请输入邮箱" />
        </NFormItemGi>
        <NFormItemGi label="手机号码" path="phone">
          <NInput v-model:value="model.phone" placeholder="请输入手机号码" />
        </NFormItemGi>
        <NFormItemGi label="用户年龄" path="age">
          <NInputNumber v-model:value="model.age" class="w-full" :precision="0" placeholder="请输入年龄" />
        </NFormItemGi>
        <NFormItemGi label="性别" path="gender">
          <NSelect v-model:value="model.gender" placeholder="请选择性别" :options="genderEnum.values" clearable />
        </NFormItemGi>
        <NFormItemGi label="用户状态" path="userStatus">
          <NSelect
            v-model:value="model.userStatus"
            placeholder="请选择用户状态"
            :options="userStatusEnum.values"
            clearable
          />
        </NFormItemGi>
        <NGi suffix :show-feedback="false" #="{ overflow }">
          <NSpace class="w-full" justify="end">
            <NButton @click="reset">
              <template #icon>
                <icon-ic-round-refresh class="text-icon" />
              </template>
              重置
            </NButton>
            <NButton type="primary" ghost @click="search">
              <template #icon>
                <icon-ic-round-search class="text-icon" />
              </template>
              搜索
            </NButton>
            <NButton circle ghost @click="collapsed = !collapsed">
              <template #icon>
                <!-- eslint-disable-next-line vue/no-undef-properties -->
                <icon-ep-arrow-up-bold v-if="!overflow" class="text-icon" />
                <icon-ep-arrow-down-bold v-else class="text-icon" />
              </template>
            </NButton>
          </NSpace>
        </NGi>
      </NGrid>
    </NForm>
  </NCard>
</template>

<style scoped></style>
