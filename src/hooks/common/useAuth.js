import { useAuthStore } from '@/store';
import { isString } from '@/utils';

export default function useAuth() {
  const authStore = useAuthStore();
  const permissionMode = import.meta.env.VITE_PERMISSION_MODE;
  const roleKey = import.meta.env.VITE_ROLE_KEY;
  const permissionKey = import.meta.env.VITE_PERMISSION_KEY;

  function hasAuth(codes) {
    if (!authStore.isLogin) {
      return false;
    }

    if (permissionMode === 'RBAC') {
      const permissionList = [...authStore.userInfo[roleKey], ...authStore.userInfo[permissionKey]];
      if (isString(codes)) {
        return permissionList.includes(codes);
      }
      return codes.some(code => permissionList.includes(code));
    }

    if (isString(codes)) {
      return authStore.userInfo[roleKey] === codes;
    }
    return codes.includes(authStore.userInfo[roleKey]);
  }

  return {
    hasAuth
  };
}
