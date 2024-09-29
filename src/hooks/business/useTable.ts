import type { Reactive } from 'vue';
import { ref, reactive, computed, watch } from 'vue';
import type { DataTableBaseColumn, DataTableExpandColumn, DataTableSelectionColumn, PaginationProps } from 'naive-ui';
import { cloneDeep } from 'lodash-es';
import type { TableColumnGroup, TableColumnTitle, TableColumnGroupTitle } from 'naive-ui/es/data-table/src/interface';
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
type HookTableColumn<T = Record<string, unknown>> =
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

/** 表格配置 */
type HookTableConfig<TableData, Fn extends ApiFn> = {
  /** 接口请求函数 */
  apiFn: Fn;
  /** 列表接口参数 */
  apiParams: any;
  /** 搜索参数格式化函数 */
  formatSearchParams?: (params: any) => GetApiFnParameters<Fn>;
  /** 列表接口返回数据转换 */
  transformer: Transformer<TableData, Service.RequestResult<GetApiFnReturnType<Fn>>>;
  /** 列表分页参数 */
  pagination?: PaginationProps;
  /** 列表列 */
  columns: () => HookTableColumn<TableData>[];
  /** 分页参数更新 */
  onPaginationChanged?: (params: Reactive<PaginationProps>) => void;
  /**
   * 是否使用分页
   * @default true
   */
  isPaging?: boolean;
  /**
   * 是否立即请求
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
    formatSearchParams = params => params,
    transformer,
    onPaginationChanged,
    isPaging = true,
    immediate = true
  } = config;

  const { columns, filteredColumns, reloadColumns } = useTableColumn<TableData>(config.columns);

  const searchParams = reactive(cloneDeep(apiParams));
  const requestParams = reactive({});

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

  /** 设置请求分页参数 */
  function setRequestPaginationParams() {
    const { page, pageSize } = formatSearchParams(searchParams);
    Object.assign(requestParams, { page, pageSize });
  }
  /** 设置请求参数 */
  function setRequestParams() {
    Object.assign(requestParams, formatSearchParams(searchParams));
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
  function handleSearch() {
    if (isPaging) updateSearchParams({ page: 1 });
    setRequestParams();
    getData();
  }

  /** 重置分页查询参数 */
  function handleSearchPaginationParams(params: any) {
    updateSearchParams(params);
    setRequestPaginationParams();
    getData();
  }

  /**
   * update search params
   *
   * @param params
   */
  function updateSearchParams(params: any) {
    Object.assign(searchParams, params);
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
    reloadColumns,
    pagination,
    updatePagination,
    getData,
    handleSearch,
    handleSearchPaginationParams,
    searchParams,
    updateSearchParams,
    resetSearchParams,
    requestParams
  };
}

function useTableColumn<TableData>(factory: () => HookTableColumn<TableData>[]) {
  const SELECTION_KEY = '__selection__';
  const EXPAND_KEY = '__expand__';

  const allColumns = ref(factory());

  const filteredColumns = ref(getFilteredColumns(factory()));

  const columns = computed(() => getColumns());

  function reloadColumns() {
    allColumns.value = factory();
    filteredColumns.value = getFilteredColumns(factory());
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

    return cols;
  }

  return {
    columns,
    reloadColumns,
    filteredColumns
  };
}

export function useTableOperate(getData: () => Promise<any>) {
  const { bool: modalVisible, setTrue: openModal, setFalse: closeModal } = useBoolean();

  const operateType = ref('add');
  /** the editing row data */
  const editingData = ref(null);

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
