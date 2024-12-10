import { defineStore } from 'pinia';
import { useRouteStore } from '../route';

export const useRememberStore = defineStore('remember-store', {
  state: () => ({
    rememberMe: false,
    userName: '',
    password: '',
    /** 是否是简洁模式 */
    isSimpleMode: false
  }),
  actions: {
    setRememberMe(value: boolean) {
      this.rememberMe = value;
    },
    setAccount(userName: string, password: string) {
      this.userName = userName;
      this.password = password;
    },
    clearAccount() {
      this.userName = '';
      this.password = '';
    },
    setSimpleMode(isSimpleMode: boolean) {
      const { reloadAuthRoute } = useRouteStore();
      this.isSimpleMode = isSimpleMode;
      reloadAuthRoute();
    }
  },
  persist: {
    key: 'rememberInfo',
    pick: ['rememberMe', 'userName', 'password', 'isSimpleMode']
  }
});
