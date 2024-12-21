import { EnumFactory } from '@/utils';

export const loginModuleEnum = new EnumFactory({
  'pwd-login': '账密登录',
  'code-login': '手机验证码登录',
  register: '注册',
  'reset-pwd': '重置密码',
  'bind-wechat': '微信绑定'
});

/** 用户性别 */
export const genderEnum = new EnumFactory({
  1: { label: '男', type: 'warning' },
  2: { label: '女', type: 'success' },
  9: { label: '其他', type: 'info' }
});
// console.log(loginModuleEnum, genderEnum);

/** 用户状态 */
export const userStatusEnum = new EnumFactory({
  1: { label: '启用', type: 'success' },
  2: { label: '禁用', type: 'error' },
  3: { label: '冻结', type: 'warning' },
  4: { label: '软删除', type: 'info' }
});
