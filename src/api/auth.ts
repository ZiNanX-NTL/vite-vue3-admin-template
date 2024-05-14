import { mockInstance } from '@/service';

interface LoginParams {
  userName: string;
  password: string;
}
/**
 * 登录
 * @param data - 请求参数
 * @param data.userName - 用户名
 * @param data.password - 密码
 */
export function fetchLogin(data: LoginParams) {
  return mockInstance.post<ApiAuth.Token>({ url: '/login', data });
}
/** 获取用户信息 */
export function fetchUserInfo() {
  return mockInstance.get({ url: '/getUserInfo' });
}

/** 获取用户信息 */
export function fetchGetUserRoutes() {
  return mockInstance.get({ url: '/getUserRoutes' });
}
