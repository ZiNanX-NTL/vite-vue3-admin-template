import { defineStore } from 'pinia';

export const useRememberStore = defineStore('remember-store', {
  state: () => ({
    rememberMe: false,
    userName: '',
    password: ''
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
    }
  },
  persist: {
    key: 'rememberInfo',
    pick: ['rememberMe', 'userName', 'password']
  }
});
