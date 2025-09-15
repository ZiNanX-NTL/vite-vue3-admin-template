<script setup lang="ts">
import type { FormInst } from 'naive-ui';

const formData = reactive({
  name: 'aaaaa',
  age: null,
  email: '',
  gender: null,
  phone: ''
});

const formItems = computed(() => [
  {
    field: 'name',
    label: 'Name',
    type: 'input',
    required: true
  },
  {
    field: 'age',
    label: 'Age',
    type: 'number',
    placeholder: '请输入年龄',
    required: true
  },
  {
    field: 'gender',
    label: 'Gender',
    type: 'select',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' }
    ],
    required: true
  },
  {
    field: 'email',
    label: 'Email',
    type: 'input',
    hidden: formData.gender === 'male',
    required: true
  },
  {
    field: 'phone',
    label: 'Phone',
    type: 'tel',
    required: true
  },
  {
    field: 'phone',
    label: 'Phone',
    type: 'tel',
    required: true
  },
  {
    field: 'handle',
    label: null,
    suffix: true
  }
]);

const rules = {
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
  ],
  age: [{ required: true, message: 'Age is required', type: 'number', trigger: 'blur' }],
  gender: [{ required: true, message: 'Gender is required', trigger: 'blur' }],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: ['blur', 'change'] }
  ],
  phone: [
    { required: true, message: 'Phone is required', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: 'Invalid phone number',
      trigger: ['blur', 'change']
    }
  ]
};

const formRef = useTemplateRef<FormInst>('formRef');

const collapsed = ref(false);

async function handleSubmit() {
  await formRef.value?.validate();
  console.log('Form submitted successfully', formData);
}
</script>

<template>
  <div>
    <FormBuilder ref="formRef" v-model="formData" :form-items="formItems" :rules="rules" :collapsed="collapsed">
      <template #handle="{ overflow }">
        <NSpace class="w-full" justify="end">
          <NButton @click="handleSubmit">
            Validate{{ overflow }}
          </NButton>
          <NButton circle ghost @click="collapsed = !collapsed">
            <template #icon>
              <icon-ep-arrow-up-bold v-if="!overflow" class="text-icon" />
              <icon-ep-arrow-down-bold v-else class="text-icon" />
            </template>
          </NButton>
        </NSpace>
      </template>
    </FormBuilder>
  </div>
</template>

<style scoped></style>
