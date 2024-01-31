import { ref } from 'vue';
import { REG_PWD, REG_PHONE, REG_USER_NAME, REG_EMAIL } from '@/config';

export function useFormRules() {
  const patternRules = {
    userName: {
      pattern: REG_USER_NAME,
      message: '用户名格式不正确',
      trigger: 'change'
    },
    phone: {
      pattern: REG_PHONE,
      message: '手机号格式不正确',
      trigger: 'change'
    },
    pwd: {
      pattern: REG_PWD,
      message: '密码格式不正确',
      trigger: 'change'
    },
    email: {
      pattern: REG_EMAIL,
      message: '邮箱格式不正确',
      trigger: 'change'
    }
  };
  const formRules = {
    userName: [createRequiredRule('请输入用户名'), patternRules.userName],
    phone: [createRequiredRule('请输入手机号'), patternRules.phone],
    pwd: [createRequiredRule('请输入密码'), patternRules.pwd],
    email: [createRequiredRule('请输入邮箱'), patternRules.email]
  };
  /** the default required rule */
  const defaultRequiredRule = createRequiredRule('不能为空');
  function createRequiredRule(message) {
    return {
      required: true,
      message
    };
  }
  return {
    patternRules,
    formRules,
    defaultRequiredRule,
    createRequiredRule
  };
}

export function useNaiveForm() {
  const formRef = ref(null);
  async function validate() {
    await formRef.value?.validate();
  }
  async function restoreValidation() {
    formRef.value?.restoreValidation();
  }
  return {
    formRef,
    validate,
    restoreValidation
  };
}
