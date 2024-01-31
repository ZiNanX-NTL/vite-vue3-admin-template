<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="title"
    :segmented="{
      content: true
    }"
    size="small"
    class="w-700px"
  >
    <n-form ref="formRef" :model="model" :rules="rules">
      <n-grid :cols="2" :x-gap="18" responsive="screen" item-responsive class="px-5px">
        <n-form-item-gi label="用户名" path="userName">
          <n-input v-model:value="model.userName" placeholder="请输入用户名" />
        </n-form-item-gi>
        <n-form-item-gi label="用户年龄" path="age">
          <n-input-number v-model:value="model.age" :precision="0" placeholder="请输入年龄" />
        </n-form-item-gi>
        <n-form-item-gi label="手机号码" path="phone">
          <n-input v-model:value="model.phone" placeholder="请输入手机号码" />
        </n-form-item-gi>
        <n-form-item-gi label="邮箱" path="email">
          <n-input v-model:value="model.email" placeholder="请输入邮箱" />
        </n-form-item-gi>
        <n-form-item-gi label="性别" path="gender">
          <n-radio-group v-model:value="model.gender">
            <n-radio v-for="item in genderEnum.values" :key="item.key" :value="item.key" :label="item.text" />
          </n-radio-group>
        </n-form-item-gi>
        <n-form-item-gi label="用户状态" path="userStatus">
          <n-radio-group v-model:value="model.userStatus">
            <n-radio v-for="item in userStatusEnum.values" :key="item.key" :value="item.key" :label="item.text" />
          </n-radio-group>
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #action>
      <n-space :size="24" justify="center">
        <n-button class="w-72px" @click="closeModal">取消</n-button>
        <n-button class="w-72px" type="primary" @click="handleSubmit">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { userStatusEnum, genderEnum } from '@/constants';
import { useFormRules, useNaiveForm } from '@/hooks';

defineOptions({
  name: 'TableActionModal'
});

const props = defineProps({
  operateType: {
    validator(value) {
      // The value must match one of these strings
      return ['add', 'edit'].includes(value);
    },
    required: true
  },
  rowData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['submitted']);

const visible = defineModel('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles = {
    add: '添加用户',
    edit: '编辑用户'
  };
  return titles[props.operateType];
});

const model = reactive(createDefaultModel());

function createDefaultModel() {
  return {
    userName: '',
    gender: null,
    age: null,
    phone: '',
    email: '',
    userStatus: null
  };
}

const rules = {
  userName: defaultRequiredRule,
  userStatus: defaultRequiredRule
};

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add') {
    Object.assign(model, createDefaultModel());
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
  }
}

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // request
  window.$message?.success('更新成功!');
  closeModal();
  emit('submitted');
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});
</script>

<style scoped></style>
