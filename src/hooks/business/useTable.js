import { ref, reactive, computed, watch } from 'vue';
import { cloneDeep } from 'lodash-es';
import { useIsMobile } from '@/utils';
import { useBoolean, useLoading } from '../common';

/**
 * 通用表格 hook
 * @param {Object} config 表格配置
 * @param {Function} config.apiFn 接口请求方法
 * @param {Object} config.apiParams 接口请求参数
 * @param {Function} config.columns 表格列配置工厂函数
 * @param {Object} config.pagination 分页配置
 * @param {Object} config.transformer 数据转换器
 * @param {Function} config.onPaginationChanged 分页变化回调
 * @param {Boolean} config.immediate 是否立即请求数据
 * @returns {Object}
 */
export function useTable(config) {
  const { loading, startLoading, endLoading } = useLoading();
  const { bool: empty, setBool: setEmpty } = useBoolean();

  const {
    apiFn,
    apiParams,
    formatSearchParams = params => params,
    transformer,
    onPaginationChanged,
    immediate = true
  } = config;

  const { columns, filteredColumns, reloadColumns } = useTableColumn(config.columns);

  const searchParams = reactive(cloneDeep(apiParams));
  const requestParams = {};

  const data = ref([]);

  const isMobile = useIsMobile();
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 15, 20, 25, 30],
    onUpdatePage: async page => {
      pagination.page = page;

      await onPaginationChanged?.(pagination);
    },
    onUpdatePageSize: async pageSize => {
      pagination.pageSize = pageSize;
      pagination.page = 1;

      await onPaginationChanged?.(pagination);
    },
    ...config.pagination
  });

  function updatePagination(update) {
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

    const { data: tableData, pageNum = pagination.page, pageSize = pagination.pageSize, total } = transformer(response);

    data.value = tableData;

    setEmpty(tableData.length === 0);
    updatePagination({ page: pageNum, pageSize, itemCount: total });
    endLoading();
  }

  /** 查询数据 */
  function handleSearch() {
    updateSearchParams({ pageNum: 1 });
    setRequestParams();
    getData();
  }

  /** 重置查询参数 */
  function handleSearchPaginationParams(params) {
    updateSearchParams(params);
    setRequestPaginationParams();
    getData();
  }

  /**
   * update search params
   *
   * @param params
   */
  function updateSearchParams(params) {
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
    resetSearchParams
  };
}

function useTableColumn(factory) {
  const SELECTION_KEY = '__selection__';

  const allColumns = ref(factory());

  const filteredColumns = ref(getFilteredColumns(factory()));

  const columns = computed(() => getColumns());

  function reloadColumns() {
    allColumns.value = factory();
    filteredColumns.value = getFilteredColumns(factory());
  }

  function getFilteredColumns(aColumns) {
    const cols = [];

    aColumns.forEach(column => {
      if (column.type === undefined) {
        cols.push({
          key: column.key,
          title: column.title,
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
        return allColumns.value.find(col => col.key === column.key);
      });

    return cols;
  }

  return {
    columns,
    reloadColumns,
    filteredColumns
  };
}

export function useTableOperate(getData) {
  const { bool: modalVisible, setTrue: openModal, setFalse: closeModal } = useBoolean();

  const operateType = ref('add');
  /** the editing row data */
  const editingData = ref(null);

  function handleAdd() {
    operateType.value = 'add';
    openModal();
  }

  function handleEdit(row) {
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
