import { mockInstance } from '@/service';

/**
 * 登录
 * @param data.userName - 用户名
 * @param data.password - 密码
 */
export function fetchLogin(data) {
  return mockInstance.post({ url: '/login', data });
}
/** 获取用户信息 */
export function fetchUserInfo() {
  return mockInstance.get({ url: '/getUserInfo' });
}
