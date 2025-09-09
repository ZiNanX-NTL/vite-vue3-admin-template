import type { Reactive } from 'vue';
import { computed, reactive, ref, watch } from 'vue';
import type {
  DataTableBaseColumn,
  DataTableColumns,
  DataTableExpandColumn,
  DataTableSelectionColumn,
  PaginationProps
} from 'naive-ui';
import { cloneDeep } from 'lodash-es';
import type { TableColumnGroup, TableColumnGroupTitle, TableColumnTitle } from 'naive-ui/es/data-table/src/interface';
import { useIsMobile } from '@/utils';
import { useBoolean, useLoading } from '../common';

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
type Transformer<TableData, Response> = (response: Response) => {
  data: TableData[];
  pageNum?: number;
  pageSize?: number;
  total?: number;
};

/** 自定义的列 key */
type CustomColumnKey<K = never> = K | 'action';

/** 表格的列 */
export type HookTableColumn<T = Record<string, unknown>> =
  | (Omit<TableColumnGroup<T>, 'key'> & { key: CustomColumnKey<keyof T> })
  | (Omit<DataTableBaseColumn<T>, 'key'> & { key: CustomColumnKey<keyof T> })
  | DataTableSelectionColumn<T>
  | DataTableExpandColumn<T>;

/** 表格操作列 */
interface CheckColumn {
  key?: string | number | symbol;
  title?: TableColumnTitle | TableColumnGroupTitle;
  checked: boolean;
}

/** 后端接收的分页参数字段配置类型 */
interface PaginationParamNames {
  page: string;
  pageSize: string;
}

/** 表格配置 */
type HookTableConfig<TableData, Fn extends ApiFn> = {
  /** 接口请求函数 */
  apiFn: Fn;
  /** 列表接口参数 */
  apiParams: any;
  /** 后端接收的分页参数字段配置 */
  paginationParamNames?: PaginationParamNames;
  /** 搜索参数格式化函数 */
  formatSearchParams?: (params: any) => GetApiFnParameters<Fn>;
  /** 列表接口返回数据转换 */
  transformer: Transformer<TableData, Service.RequestResult<GetApiFnReturnType<Fn>>>;
  /** 列表分页参数 */
  pagination?: PaginationProps;
  /** 分页参数是否分离 */
  isSeparatePagination?: boolean;
  /** 分页参数分离状态分页参数 */
  paginationParams?: {
    pageNum: number;
    pageSize: number;
  };
  /** 列表列 */
  columns: () => HookTableColumn<TableData>[];
  /** 分页参数更新 */
  onPaginationChanged?: (params: Reactive<PaginationProps>) => void;
  /**
   * 是否使用分页
   *
   * @default true
   */
  isPaging?: boolean;
  /**
   * 是否立即请求
   *
   * @default true
   */
  immediate?: boolean;
};

/** 通用表格 hook */
export function useTable<TableData, Fn extends ApiFn>(config: HookTableConfig<TableData, Fn>) {
  const { loading, startLoading, endLoading } = useLoading();
  const { bool: empty, setBool: setEmpty } = useBoolean();

  const {
    apiFn,
    apiParams,
    paginationParamNames = {
      page: 'page',
      pageSize: 'pageSize'
    },
    paginationParams = {
      pageNum: 1,
      pageSize: 10
    },
    formatSearchParams = params => params,
    transformer,
    onPaginationChanged,
    isPaging = true,
    immediate = true,
    isSeparatePagination = false
  } = config;

  const searchParams = reactive(cloneDeep(apiParams));
  const requestParams = reactive<any>({});
  const paginationSearchParams = reactive(cloneDeep(paginationParams));

  const { columns, filteredColumns, reloadColumns, columnsWidth, allColumns } = useTableColumn<TableData>(
    config.columns,
    searchParams
  );

  const data = ref<TableData[]>([]);

  const isMobile = useIsMobile();
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 15, 20, 25, 30],
    onUpdatePage: async (page: number) => {
      pagination.page = page;

      await onPaginationChanged?.(pagination);
    },
    onUpdatePageSize: async (pageSize: number) => {
      pagination.pageSize = pageSize;
      pagination.page = 1;

      await onPaginationChanged?.(pagination);
    },
    ...config.pagination
  });

  function updatePagination(update: Partial<PaginationProps>) {
    Object.assign(pagination, update);
  }

  /** 转换请求分页参数 */
  function transformPaginationParams(params: Record<string, any>): Record<string, any> {
    // 如果不需要分页或参数为空，直接返回
    if (!isPaging || !paginationParamNames) return params;
    const { page, pageSize, ...rest } = params;
    if (isSeparatePagination)
      return {
        [paginationParamNames.page]: paginationSearchParams.pageNum,
        [paginationParamNames.pageSize]: paginationSearchParams.pageSize,
        ...rest
      };
    return {
      [paginationParamNames.page]: page,
      [paginationParamNames.pageSize]: pageSize,
      ...rest
    };
  }

  /** 设置请求分页参数 */
  function setRequestPaginationParams() {
    const { page, pageSize } = formatSearchParams(searchParams);
    Object.assign(requestParams, transformPaginationParams({ page, pageSize }));
  }
  /** 设置请求参数 */
  function setRequestParams() {
    const formattedParams = formatSearchParams(searchParams);
    Object.assign(requestParams, transformPaginationParams(formattedParams));
  }

  async function getData() {
    startLoading();

    const response = await apiFn(requestParams);

    const {
      data: tableData = [],
      pageNum = pagination.page,
      pageSize = pagination.pageSize,
      total
    } = transformer(response);

    data.value = tableData;

    setEmpty(tableData.length === 0);
    updatePagination({ page: pageNum, pageSize, itemCount: total });
    endLoading();
  }

  /** 查询数据 */
  async function handleSearch() {
    if (isPaging && pagination) updateSearchParams({ page: 1 });
    setRequestParams();
    await getData();
  }

  /** 重置分页查询参数 */
  async function handleSearchPaginationParams(params: any) {
    updateSearchParams(params);
    setRequestPaginationParams();
    await getData();
  }

  /**
   * update search params
   *
   * @param params
   */
  function updateSearchParams(params: any) {
    if (isSeparatePagination) {
      // 提取分页参数
      const { page, pageSize, ...restParams } = params;

      // 更新分离的分页参数
      if (page !== undefined) {
        paginationSearchParams.pageNum = page;
      }
      if (pageSize !== undefined) {
        paginationSearchParams.pageSize = pageSize;
      }

      // 更新非分页参数
      Object.assign(searchParams, restParams);
    } else {
      // 非分离模式，直接合并所有参数
      Object.assign(searchParams, params);
    }
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

  watch(
    isMobile,
    newValue => {
      if (newValue) {
        Object.assign(pagination, { pageSlot: 3 });
      } else {
        Object.assign(pagination, { pageSlot: 9 });
      }
    },
    { immediate: true }
  );

  return {
    loading,
    empty,
    data,
    columns,
    filteredColumns,
    columnsWidth,
    allColumns,
    reloadColumns,
    pagination,
    updatePagination,
    getData,
    handleSearch,
    handleSearchPaginationParams,
    searchParams,
    updateSearchParams,
    resetApiParams,
    resetSearchParams,
    requestParams,
    paginationSearchParams
  };
}

function useTableColumn<TableData>(factory: (p: any) => HookTableColumn<TableData>[], params: any) {
  const SELECTION_KEY = '__selection__';
  const EXPAND_KEY = '__expand__';

  const allColumns = ref(factory(params));

  const filteredColumns = ref(getFilteredColumns(factory(params)));

  const columns = computed(() => getColumns());

  const columnsWidth = computed(() => {
    let totalWidth = 0;

    function calculateColumnWidth(column: any): number {
      // 如果是多级表头，递归计算子列宽度
      if (column.children && Array.isArray(column.children)) {
        return column.children.reduce((sum: number, child: any) => sum + calculateColumnWidth(child), 0);
      }

      // 计算单列宽度
      const width = typeof column.width === 'string' ? Number.parseInt(column.width, 10) : column.width || 0;
      return width;
    }

    columns.value.forEach(column => {
      totalWidth += calculateColumnWidth(column);
    });

    return totalWidth;
  });

  function reloadColumns() {
    allColumns.value = factory(params);
    filteredColumns.value = getFilteredColumns(factory(params));
  }

  function getFilteredColumns(aColumns: HookTableColumn<TableData>[]) {
    const cols: CheckColumn[] = [];

    aColumns.forEach(column => {
      if (column.type === undefined) {
        cols.push({
          key: column.key,
          title: column.title,
          checked: true
        });
      }

      if (column.type === 'expand') {
        cols.push({
          key: EXPAND_KEY,
          title: '展开',
          checked: true
        });
      }

      if (column.type === 'selection') {
        cols.push({
          key: SELECTION_KEY,
          title: '勾选',
          checked: true
        });
      }
    });

    return cols;
  }

  function getColumns() {
    const cols = filteredColumns.value
      .filter(column => column.checked)
      .map(column => {
        if (column.key === SELECTION_KEY) {
          return allColumns.value.find(col => col.type === 'selection');
        }
        if (column.key === EXPAND_KEY) {
          return allColumns.value.find(col => col.type === 'expand');
        }
        return allColumns.value.find((col: any) => col.key === column.key);
      });

    return cols as DataTableColumns<TableData>;
  }

  return {
    columns,
    reloadColumns,
    filteredColumns,
    columnsWidth,
    allColumns
  };
}

export function useTableOperate(getData: () => Promise<any>) {
  const { bool: modalVisible, setTrue: openModal, setFalse: closeModal } = useBoolean();

  const operateType = ref<'add' | 'edit'>('add');
  /** the editing row data */
  const editingData = ref<Record<string, any> | null>(null);

  function handleAdd() {
    operateType.value = 'add';
    openModal();
  }

  function handleEdit(row: any) {
    operateType.value = 'edit';
    editingData.value = row || null;

    openModal();
  }

  /** the hook after the delete operation is completed */
  async function onDeleted() {
    window.$message?.success('删除成功');

    await getData();
  }

  return {
    modalVisible,
    openModal,
    closeModal,
    operateType,
    editingData,
    handleAdd,
    handleEdit,
    onDeleted
  };
}
