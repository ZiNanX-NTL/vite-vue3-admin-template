import type { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';
import { handleAxiosError, handleBackendError, handleResponseError, handleServiceResult } from '../helpers';

interface InstanceInterceptors {
  requestInterceptor?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  requestInterceptorCatch?: (error: any) => any;
  responseInterceptor?: (res: any) => any;
  responseInterceptorCatch?: (error: any) => any;
}
/** 单一请求拦截器配置 */
interface SingleRequestInterceptors {
  requestInterceptor?: (config: SingleRequestAxiosRequestConfig) => SingleRequestAxiosRequestConfig;
  responseInterceptor?: (res: any) => any;
}
interface InstanceAxiosRequestConfig extends AxiosRequestConfig {
  interceptors?: InstanceInterceptors;
}
interface SingleRequestAxiosRequestConfig extends AxiosRequestConfig {
  interceptors?: SingleRequestInterceptors;
}

class ZNRequest {
  instance: AxiosInstance;

  // 该属性从实例中获取
  interceptors: InstanceInterceptors | undefined;

  // 后端数据字段配置
  backendConfig;

  constructor(
    axiosConfig: InstanceAxiosRequestConfig,
    backendConfig = {
      codeKey: 'code',
      dataKey: 'data',
      msgKey: 'message',
      successCode: 200
    }
  ) {
    this.instance = axios.create(axiosConfig);
    // 从实例配置config中获取拦截器配置
    this.interceptors = axiosConfig.interceptors;
    this.backendConfig = backendConfig;

    this.setInterceptor();
  }

  /** 设置请求拦截器 */
  setInterceptor() {
    // 全局请求拦截
    this.instance.interceptors.request.use(
      config => {
        console.log('全局请求拦截');
        return config;
      },
      (axiosError: AxiosError) => {
        console.log('全局请求失败拦截', axiosError);
        const error = handleAxiosError(axiosError);
        return handleServiceResult(error, null);
      }
    );
    // 全局响应拦截
    this.instance.interceptors.response.use(
      (async response => {
        console.log('全局响应拦截');
        const { status } = response;
        if (status === 200 || status < 300 || status === 304) {
          const backend = response.data;
          const { codeKey, dataKey, successCode } = this.backendConfig;
          // 请求成功
          if (backend[codeKey] === successCode) {
            return handleServiceResult(null, backend[dataKey]);
          }

          const error = handleBackendError(backend, this.backendConfig);
          return handleServiceResult(error, null);
        }
        const error = handleResponseError(response);
        return handleServiceResult(error, null);
      }) as (response: AxiosResponse<any, any>) => any,
      (axiosError: AxiosError) => {
        console.log('全局响应失败拦截', axiosError);
        const error = handleAxiosError(axiosError);
        return handleServiceResult(error, null);
      }
    );

    // 实例级别拦截
    this.instance.interceptors.request.use(
      this.interceptors?.requestInterceptor,
      this.interceptors?.requestInterceptorCatch
    );
    this.instance.interceptors.response.use(
      this.interceptors?.responseInterceptor,
      this.interceptors?.responseInterceptorCatch
    );
  }

  get<T>(config: SingleRequestAxiosRequestConfig) {
    return this.request<T>({
      ...config,
      method: 'GET'
    });
  }

  post<T>(config: SingleRequestAxiosRequestConfig) {
    return this.request<T>({
      ...config,
      method: 'POST'
    });
  }

  request<T>(config: SingleRequestAxiosRequestConfig): Promise<Service.RequestResult<T>> {
    let resConfig = config;
    return new Promise((resolve, reject) => {
      // 请求拦截设置位置
      if (resConfig.interceptors?.requestInterceptor) {
        resConfig = resConfig.interceptors.requestInterceptor(resConfig);
      }

      this.instance
        .request(resConfig)
        .then(response => {
          let res = response;
          // 响应拦截设置位置
          if (resConfig.interceptors?.responseInterceptor) {
            res = resConfig.interceptors.responseInterceptor(res);
          }
          resolve(res as unknown as Service.RequestResult<T>);
        })
        .catch(err => {
          console.log('=====', err);
          reject(err);
        });
    });
  }
}

export { ZNRequest };
