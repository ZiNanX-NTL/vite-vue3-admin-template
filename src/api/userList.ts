import { mockInstance } from '@/service';
import { adapter } from '@/service/helpers';
import { adapterOfFetchUserList } from './userList.adapter';

/**
 * 获取分页用户列表数据
 * @param { Object } params - 负载参数
 */
export async function fetchUserList(params: any) {
  const data = await mockInstance.post({ url: '/userList', data: params });
  return adapter(adapterOfFetchUserList, data);
}
/**
 * 获取所有用户列表数据
 * @param { Object } params - 负载参数
 */
export async function fetchAllUserList() {
  const data = await mockInstance.get({ url: '/allUserList' });
  return adapter(adapterOfFetchUserList, data);
}
