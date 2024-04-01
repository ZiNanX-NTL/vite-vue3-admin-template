import { mockInstance } from '@/service';

/**
 * 登录
 * @param { LoginParams } data - 负载参数
 */
export function fetchLogin(data) {
  return mockInstance.post({ url: '/login', data });
}
/** 获取用户信息 */
export function fetchUserInfo() {
  return mockInstance.get({ url: '/getUserInfo' });
}

/** 获取用户信息 */
export function fetchGetUserRoutes() {
  return mockInstance.get({ url: '/getUserRoutes' });
}
