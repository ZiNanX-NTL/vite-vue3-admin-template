import { localStg } from '@/utils';
import { ZNRequest } from '../request';
import { transformRequestData } from '../helpers';

export const mockInstance = new ZNRequest({
  baseURL: '/mock',
  interceptors: {
    async requestInterceptor(config) {
      console.log('实例请求拦截');
      const handleConfig = { ...config };
      if (handleConfig.headers) {
        // 数据转换
        const contentType = handleConfig.headers['Content-Type'] as Service.ContentType;
        handleConfig.data = await transformRequestData(handleConfig.data, contentType);
        // 设置token
        handleConfig.headers.Authorization = localStg.get('token') || '';
      }
      return handleConfig;
    }
  }
});
