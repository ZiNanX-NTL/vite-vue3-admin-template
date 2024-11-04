import { ref, reactive } from 'vue';
import { cloneDeep } from 'lodash-es';
import { useLoading } from '../common';

/** 接口请求函数 */
type ApiFn<T = any, R = any> = (args: T) => Promise<Service.RequestResult<R>>;

/** 接口请求函数的参数 */
type GetApiFnParameters<T extends ApiFn, R = any> = T extends (args: infer P) => Promise<Service.RequestResult<R>>
  ? P
  : never;

/** 接口请求函数的返回值 */
type GetApiFnReturnType<T extends ApiFn, P = any> = T extends (args: P) => Promise<Service.RequestResult<infer R>>
  ? R
  : never;

/** 表格接口请求后转换后的数据 */
type Transformer<Data, Response> = (response: Response) => {
  data: Data;
};

/** 表格配置 */
type HookListConfig<Data, Fn extends ApiFn> = {
  /** 接口请求函数 */
  apiFn: Fn;
  /** 列表接口参数 */
  apiParams: any;
  /** 搜索参数格式化函数 */
  formatSearchParams?: (params: any) => GetApiFnParameters<Fn>;
  /** 数据接口返回数据转换 */
  transformer?: Transformer<Data, Service.RequestResult<GetApiFnReturnType<Fn>>>;
  /**
   * 是否立即请求
   * @default true
   */
  immediate?: boolean;
};

/** 通用表格 hook */
export function useData<Data, Fn extends ApiFn>(config: HookListConfig<Data, Fn>) {
  const { loading, startLoading, endLoading } = useLoading();

  const {
    apiFn,
    apiParams,
    formatSearchParams = params => params,
    transformer = res => res,
    immediate = true
  } = config;

  const searchParams = reactive(cloneDeep(apiParams));
  const requestParams = reactive<any>({});

  const data = ref<Data>({} as Data);
  /** 设置请求参数 */
  function setRequestParams() {
    Object.assign(requestParams, formatSearchParams(searchParams));
  }

  async function getData() {
    startLoading();

    const response = await apiFn(requestParams);

    const { data: outputData = {} } = transformer(response);

    data.value = outputData;

    endLoading();
  }

  /** 查询数据 */
  async function handleSearch() {
    setRequestParams();
    await getData();
  }

  /**
   * update search params
   *
   * @param params
   */
  function updateSearchParams(params: any) {
    Object.assign(searchParams, params);
  }

  /** 重置初始参数(特殊情况下使用,最好不要重复调用) */
  function resetApiParams(params: any) {
    Object.assign(apiParams, params);
  }
  /** reset search params */
  function resetSearchParams() {
    Object.assign(searchParams, cloneDeep(apiParams));
  }

  if (immediate) {
    handleSearch();
  }

  return {
    loading,
    data,
    getData,
    handleSearch,
    searchParams,
    updateSearchParams,
    resetApiParams,
    resetSearchParams,
    requestParams
  };
}
