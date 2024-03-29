import { useAuthStore } from '@/store';
import { isString } from '@/utils';

export default function useAuth() {
  const authStore = useAuthStore();
  const permissionMode = import.meta.env.VITE_PERMISSION_MODE;
  const permissionKey = import.meta.env.VITE_PERMISSION_KEY;

  function hasAuth(codes) {
    if (!authStore.isLogin) {
      return false;
    }

    if (permissionMode === 'RBAC') {
      if (isString(codes)) {
        return authStore.userInfo[permissionKey].includes(codes);
      }
      return codes.some(code => authStore.userInfo[permissionKey].includes(code));
    }

    if (isString(codes)) {
      return authStore.userInfo[permissionKey] === codes;
    }
    return codes.includes(authStore.userInfo[permissionKey]);
  }

  return {
    hasAuth
  };
}
