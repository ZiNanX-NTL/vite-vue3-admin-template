import { mockInstance } from '@/service';
import { adapter } from '@/service/helpers';
import { adapterOfFetchUserList } from './userList.adapter';

/**
 * 登录
 * @param { Object } params - 负载参数
 */
export const fetchUserList = async params => {
  const data = await mockInstance.post({ url: '/userList', data: params });
  return await adapter(adapterOfFetchUserList, data);
};
