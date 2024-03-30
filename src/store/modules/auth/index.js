import { unref, nextTick } from 'vue';
import { defineStore } from 'pinia';
import { router } from '@/router';
import { localStg, useRouterPush } from '@/utils';
import { fetchLogin, fetchUserInfo } from '@/api';
import { useRouteStore } from '../route';
import { clearAuthStorage, getToken, getUserInfo } from './helpers';

export const useAuthStore = defineStore('auth-store', {
  state: () => ({
    userInfo: getUserInfo(),
    token: getToken(),
    loginLoading: false
  }),
  getters: {
    /** 是否登录 */
    isLogin(state) {
      return Boolean(state.token);
    }
  },
  actions: {
    /** 重置auth状态 */
    resetAuthStore() {
      const { toLogin } = useRouterPush();
      const { resetRouteStore } = useRouteStore();
      const route = unref(router.currentRoute);

      clearAuthStorage();
      this.$reset();

      if (!route.meta.constant) {
        toLogin();
      }

      nextTick(() => {
        resetRouteStore();
      });
    },
    /**
     * 登录
     * @param {LoginParams['userName']} userName - 用户名
     * @param {LoginParams['password']} password - 密码
     */
    async login(userName, password, redirect = true) {
      this.loginLoading = true;
      const { data: loginToken, error } = await fetchLogin({ userName, password });
      if (!error) {
        await this.handleActionAfterLogin(loginToken, redirect);
      } else {
        this.resetAuthStore();
      }
      this.loginLoading = false;
    },
    /**
     * 处理登录后成功或失败的逻辑
     * @param backendToken - 返回的token
     */
    async handleActionAfterLogin(backendToken, redirect = true) {
      const route = useRouteStore();
      const { toLoginRedirect } = useRouterPush();

      const loginSuccess = await this.loginByToken(backendToken);

      if (loginSuccess) {
        await route.initAuthRoute();

        // 跳转登录后的地址
        if (redirect) {
          toLoginRedirect();
        }

        // 登录成功弹出欢迎提示
        if (route.isInitAuthRoute) {
          window.$notification?.success({
            title: '登录成功',
            content: `欢迎回来, ${this.userInfo.userName}`,
            duration: 3000
          });
        }

        return;
      }

      // 不成功则重置状态
      this.resetAuthStore();
    },
    /**
     * 根据token进行登录
     * @param backendToken - 返回的token
     */
    async loginByToken(backendToken) {
      // 先把token存储到缓存中(后面接口的请求头需要token)
      const { token, refreshToken } = backendToken;
      localStg.set('token', token);
      localStg.set('refreshToken', refreshToken);

      // 获取用户信息
      const { data: info, error } = await fetchUserInfo();
      if (!error) {
        // 成功后把用户信息存储到缓存中
        localStg.set('userInfo', info);

        // 更新状态
        this.userInfo = info;
        this.token = token;

        return true;
      }

      return false;
    }
  }
});
