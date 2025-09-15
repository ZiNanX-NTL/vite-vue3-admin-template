import { axiosRequestAdapter } from '@alova/adapter-axios';
import { createAlova } from 'alova';
import VueHook from 'alova/vue';
import { localStg } from '@/utils';
import { transformRequestData } from '../helpers';
import { Request } from '../request';

export const mockAlova = createAlova({
  baseURL: '/mock',
  statesHook: VueHook,
  requestAdapter: axiosRequestAdapter({
    axios: new Request().instance
  }),
  async beforeRequest(method) {
    const { config } = method;
    if (config.headers) {
      // 数据转换
      const contentType = config.headers['Content-Type'] as Service.ContentType;
      const data = await transformRequestData(method.data, contentType);
      if (method.data !== undefined) {
        method.data = data;
      }
      // 设置token
      config.headers.Authorization = localStg.get('token') || '';
    }
  }
});
