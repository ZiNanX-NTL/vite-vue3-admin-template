import { useAuthStore, useRouteStore } from '@/store';
import { isString } from '@/utils';

export default function useAuth() {
  const authStore = useAuthStore();
  const routeStore = useRouteStore();

  function hasAuth(codes: string | string[]) {
    if (!authStore.isLogin) {
      return false;
    }

    if (routeStore.permissionMode === 'RBAC') {
      const permissionList = [
        ...authStore.userInfo[routeStore.roleKey],
        ...authStore.userInfo[routeStore.permissionKey]
      ];
      if (isString(codes)) {
        return permissionList.includes(codes);
      }
      return codes.some(code => permissionList.includes(code));
    }

    if (isString(codes)) {
      return authStore.userInfo[routeStore.roleKey] === codes;
    }
    return codes.includes(authStore.userInfo[routeStore.roleKey]);
  }

  return {
    hasAuth
  };
}
