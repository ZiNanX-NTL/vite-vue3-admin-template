import { mockAlova, mockInstance } from '@/service';
import { adapter } from '@/service/helpers';
import { adapterOfFetchUserList } from './userList.adapter';

/**
 * 获取分页用户列表数据
 *
 * @param {object} params - 负载参数
 */
export function fetchUserList(params: any) {
  return mockAlova.Post(
    '/userList',
    { ...params },
    {
      transform(data: Service.RequestResult<unknown>) {
        return adapter(adapterOfFetchUserList, data);
      }
    }
  );
}
/**
 * 获取所有用户列表数据
 */
export async function fetchAllUserList() {
  const data = await mockInstance.get({ url: '/allUserList' });
  return adapter(adapterOfFetchUserList, data);
}
