<template>
  <div class="flex-vertical-full gap-16px <sm:overflow-auto">
    <table-search v-model:model="searchParams" @reset="resetSearchParams" @search="handleSearch"></table-search>
    <n-card :bordered="false" size="small" title="表格" class="h-full card-wrapper">
      <template #header-extra>
        <table-header-operation
          v-model:columns="filteredColumns"
          :loading="loading"
          @add="handleAdd"
          @refresh="getData"
        />
      </template>
      <n-data-table
        class="sm:h-full"
        :columns="columns"
        :data="data"
        :flex-height="!isMobile"
        :scroll-x="640"
        :loading="loading"
        :pagination="pagination"
        :row-key="item => item.id"
        remote
      />
      <table-action-modal
        v-model:visible="modalVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getData"
      />
    </n-card>
  </div>
</template>

<script setup lang="jsx">
import { NSpace, NPopconfirm, NButton } from 'naive-ui';
import { genderEnum, userStatusEnum } from '@/constants';
import { useTable, useTableOperate } from '@/hooks';
import { useIsMobile } from '@/utils';
import { fetchUserList } from '@/api';
import TableActionModal from './components/TableActionModal.vue';
import TableSearch from './components/TableSearch.vue';

const isMobile = useIsMobile();

const {
  columns,
  filteredColumns,
  data,
  loading,
  pagination,
  getData,
  handleSearch,
  handleSearchPaginationParams,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchUserList,
  apiParams: {
    page: 1,
    pageSize: 20,

    // 如果要在Form中使用searchParams，则需要定义以下属性，并且该值为null
    // 该值不能为undefined，否则Form中的属性将不起作用
    userName: '',
    gender: null,
    age: null,
    phone: '',
    email: '',
    userStatus: null,

    dataTypes: [1],
    dataSources: [1],
    checkedKeys: ['0']
  },
  onPaginationChanged: p => {
    handleSearchPaginationParams({ page: p.page, pageSize: p.pageSize });
  },
  formatSearchParams: params => {
    const formattedParams = { ...params };

    formattedParams.dataTypes = params.dataTypes.join(',');
    formattedParams.dataSources = params.dataSources.join(',');

    return formattedParams;
  },
  transformer: res => {
    const { records = [], current = 1, size = 10, total = 0 } = res.data || {};

    return {
      data: records,
      pageNum: current,
      pageSize: size,
      total
    };
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center'
    },
    {
      key: 'index',
      title: '序号',
      align: 'center'
    },
    {
      key: 'userName',
      title: '用户名',
      align: 'center'
    },
    {
      key: 'age',
      title: '用户年龄',
      align: 'center'
    },
    {
      key: 'gender',
      title: '性别',
      align: 'center',
      render: row => {
        if (row.gender) {
          return <NTag type={genderEnum.get(row.gender).type}>{genderEnum.get(row.gender).label}</NTag>;
        }

        return <span></span>;
      }
    },
    {
      key: 'phone',
      title: '手机号码',
      align: 'center'
    },
    {
      key: 'email',
      title: '邮箱',
      align: 'center'
    },
    {
      key: 'userStatus',
      title: '状态',
      align: 'center',
      render: row => {
        if (row.userStatus) {
          return <NTag type={userStatusEnum.get(row.userStatus).type}>{userStatusEnum.get(row.userStatus).label}</NTag>;
        }
        return <span></span>;
      }
    },
    {
      key: 'actions',
      title: '操作',
      align: 'center',
      render: row => {
        return (
          <NSpace justify="center">
            <NButton type="primary" ghost size="small" onClick={() => handleEditTable(row)}>
              编辑
            </NButton>
            <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
              {{
                default: () => '确认删除',
                trigger: () => (
                  <NButton type="error" ghost size="small">
                    删除
                  </NButton>
                )
              }}
            </NPopconfirm>
          </NSpace>
        );
      }
    }
  ]
});

const { modalVisible, operateType, handleAdd, editingData, handleEdit, onDeleted } = useTableOperate(getData);

function handleEditTable(row) {
  handleEdit(row);
}

function handleDelete(id) {
  console.log(id);
  onDeleted();
}
</script>

<style scoped></style>
