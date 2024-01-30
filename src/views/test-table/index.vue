<template>
  <div class="flex-vertical-stretch">
    <n-card :bordered="false" size="small" title="表格" class="card-wrapper h-full">
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="filteredColumns"
          :disabled-delete="true"
          :loading="loading"
          @refresh="getData"
        />
        <!-- @add="handleAdd"
				@delete="handleBatchDelete"
				 -->
      </template>
      <n-data-table
        class="h-full"
        :columns="columns"
        :data="data"
        flex-height
        :loading="loading"
        :pagination="pagination"
        :row-key="item => item.id"
        remote
      />
    </n-card>
  </div>
</template>

<script setup lang="jsx">
import { NSpace, NPopconfirm, NButton } from 'naive-ui';
import { genderEnum, userStatusEnum } from '@/constants';
import { useTable, useBoolean } from '@/hooks';
import { fetchUserList } from '@/api';
// import TableColumnSetting from './components/column-setting.vue';
// import TableActionModal from './components/table-action-modal.vue';

const {
  columns,
  filteredColumns,
  data,
  loading,
  pagination,
  getData,
  updateSearchParams,
  searchParams,
  resetSearchParams
} = useTable({
  apiFn: fetchUserList,
  apiParams: {
    page: 1,
    pageSize: 10
    // 如果要在Form中使用searchParams，则需要定义以下属性，并且该值为null
    // 该值不能为undefined，否则Form中的属性将不起作用
  },
  onPaginationChanged: p => {
    updateSearchParams({ page: p.page, pageSize: p.pageSize });
    getData();
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
          return <NTag type={genderEnum[row.gender].type}>{genderEnum[row.gender].text}</NTag>;
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
          return <NTag type={userStatusEnum[row.userStatus].type}>{userStatusEnum[row.userStatus].text}</NTag>;
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
          <NSpace justify={'center'}>
            <NButton size={'small'} onClick={() => handleEditTable(row.id)}>
              编辑
            </NButton>
            <NPopconfirm onPositiveClick={() => handleDeleteTable(row.id)}>
              {{
                default: () => '确认删除',
                trigger: () => <NButton size={'small'}>删除</NButton>
              }}
            </NPopconfirm>
          </NSpace>
        );
      }
    }
  ]
});

const { bool: visible, setTrue: openModal } = useBoolean();

const modalType = ref('add');

function setModalType(type) {
  modalType.value = type;
}

const editData = ref(null);

function setEditData(item) {
  editData.value = item;
}

function handleAddTable() {
  openModal();
  setModalType('add');
}

function handleEditTable(id) {
  const findItem = data.value.find(item => item.id === id);
  if (findItem) {
    setEditData(findItem);
  }
  setModalType('edit');
  openModal();
}

function handleDeleteTable(id) {
  console.log(id);
}
</script>

<style scoped></style>
