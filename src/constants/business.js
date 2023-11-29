import { EnumFactory } from '@/utils';

export const loginModuleEnum = new EnumFactory({
  'pwd-login': '账密登录',
  'code-login': '手机验证码登录',
  register: '注册',
  'reset-pwd': '重置密码',
  'bind-wechat': '微信绑定'
});

/** 用户性别 */
const genderEnum = new EnumFactory(
  {
    1: { text: '男', type: 'priary' },
    2: { text: '女', type: 'warning' },
    9: { text: '其他', type: 'info' }
  },
  parseInt
);
console.log(genderEnum);
