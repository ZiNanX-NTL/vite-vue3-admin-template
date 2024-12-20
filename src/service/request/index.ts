import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
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
interface IBackendConfig {
	codeKey: string;
	dataKey: string;
	msgKey: string;
	successCode: number | string;
}

class Request {
	instance: AxiosInstance;

	// 后端数据字段配置
	backendConfig;

	constructor(
		axiosConfig?: InstanceAxiosRequestConfig,
		backendConfig: IBackendConfig = {
			codeKey: 'code',
			dataKey: 'data',
			msgKey: 'message',
			successCode: 200
		}
	) {
		this.instance = axios.create(axiosConfig);
		this.backendConfig = backendConfig;

		this.setInterceptor();
	}

	/** 设置请求拦截器 */
	setInterceptor() {
		// 全局请求拦截
		this.instance.interceptors.request.use(
			config => {
				return config;
			},
			(axiosError: AxiosError) => {
				const error = handleAxiosError(axiosError);
				return handleServiceResult(error, null);
			}
		);
		// 全局响应拦截
		this.instance.interceptors.response.use(
			(async response => {
				const { status } = response;
				if (status === 200 || status < 300 || status === 304) {
					const backend = { ...response.data, url: response.config.url };
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
				const error = handleAxiosError(axiosError);
				return handleServiceResult(error, null);
			}
		);
	}
}

class ZNRequest extends Request {
	// 该属性从实例中获取
	interceptors: InstanceInterceptors | undefined;

	constructor(
		axiosConfig: InstanceAxiosRequestConfig,
		backendConfig: IBackendConfig = {
			codeKey: 'code',
			dataKey: 'data',
			msgKey: 'message',
			successCode: 200
		}
	) {
		super(axiosConfig, backendConfig);
		// 从实例配置config中获取拦截器配置
		this.interceptors = axiosConfig.interceptors;

		this.setInstanceInterceptor();
	}

	/** 设置实例级别请求拦截器 */
	setInstanceInterceptor() {
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

	get<T = any>(config: SingleRequestAxiosRequestConfig) {
		return this.request<T>({
			...config,
			method: 'GET'
		});
	}

	post<T = any>(config: SingleRequestAxiosRequestConfig) {
		return this.request<T>({
			...config,
			method: 'POST'
		});
	}

	request<T = any>(config: SingleRequestAxiosRequestConfig): Promise<Service.RequestResult<T>> {
		let resConfig = config;
		return new Promise((resolve, reject) => {
			// 设置接口级别请求拦截器
			if (resConfig.interceptors?.requestInterceptor) {
				resConfig = resConfig.interceptors.requestInterceptor(resConfig);
			}

			this.instance
				.request(resConfig)
				.then(response => {
					let res = response;
					// 设置接口级别响应级别拦截器
					if (resConfig.interceptors?.responseInterceptor) {
						res = resConfig.interceptors.responseInterceptor(res);
					}
					resolve(res as unknown as Service.RequestResult<T>);
				})
				.catch(err => {
					// console.log('=====', err);
					reject(err);
				});
		});
	}
}

export { Request, ZNRequest };
