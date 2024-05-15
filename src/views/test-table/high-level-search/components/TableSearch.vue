<template>
  <n-flex :size="16" :wrap="false">
    <n-card v-if="!collapsed" title="高级搜索" :bordered="false" size="small" class="w-350px card-wrapper">
      <n-scrollbar :style="{ height: treeHeight + 'px' }">
        <n-tree
          block-line
          cascade
          check-strategy="parent"
          :selectable="false"
          :data="searchTreeData"
          :default-expanded-keys="defaultExpandedKeys"
          check-on-click
          checkable
          :checked-keys="model.checkedKeys"
          @update:checked-keys="handleCheckedKeysChange"
        />
      </n-scrollbar>
    </n-card>
    <n-card :title="collapsed ? '搜索' : '基础搜索'" :bordered="false" size="small" class="card-wrapper">
      <n-form ref="formRef" :model="model" :rules="rules" label-placement="left">
        <n-grid
          cols="1 s:2 m:5"
          :x-gap="24"
          responsive="screen"
          item-responsive
          :collapsed="collapsed"
          :collapsed-rows="2"
        >
          <n-form-item-gi label="用户名" path="userName">
            <n-input v-model:value="model.userName" placeholder="请输入用户名" />
          </n-form-item-gi>
          <n-form-item-gi label="邮箱" path="email">
            <n-input v-model:value="model.email" placeholder="请输入邮箱" />
          </n-form-item-gi>
          <n-form-item-gi label="手机号码" path="phone">
            <n-input v-model:value="model.phone" placeholder="请输入手机号码" />
          </n-form-item-gi>
          <n-form-item-gi label="用户年龄" path="age">
            <n-input-number v-model:value="model.age" class="w-full" :precision="0" placeholder="请输入年龄" />
          </n-form-item-gi>
          <n-form-item-gi label="性别" path="gender">
            <n-select v-model:value="model.gender" placeholder="请选择性别" :options="genderEnum.values" clearable />
          </n-form-item-gi>
          <n-form-item-gi label="用户状态" path="userStatus">
            <NSelect
              v-model:value="model.userStatus"
              placeholder="请选择用户状态"
              :options="userStatusEnum.values"
              clearable
            />
          </n-form-item-gi>
          <n-form-item-gi :span="5">
            <div class="w-full">
              <n-divider class="!mb-14px !mt-0" />
              <tag-select
                v-model="model.dataTypes"
                label-class="w-100px text-right"
                label="数据集类型"
                :options="dataTypeOptions"
              ></tag-select>
              <n-divider class="!my-14px" />
              <tag-select
                v-model="model.dataSources"
                label-class="w-100px text-right"
                label="数据来源"
                :options="dataSourceOptions"
              ></tag-select>
            </div>
          </n-form-item-gi>
          <n-gi span="2 xl:1" suffix :show-feedback="false" #="{ overflow }">
            <n-space class="w-full" justify="end">
              <n-button @click="reset">
                <template #icon>
                  <icon-ic-round-refresh class="text-icon" />
                </template>
                重置
              </n-button>
              <n-button type="primary" ghost @click="search">
                <template #icon>
                  <icon-ic-round-search class="text-icon" />
                </template>
                搜索
              </n-button>
              <n-button ghost circle @click="collapsed = !collapsed">
                <template #icon>
                  <icon-ep-arrow-up-bold v-if="!overflow" class="text-icon" />
                  <icon-ep-arrow-down-bold v-else class="text-icon" />
                </template>
              </n-button>
            </n-space>
          </n-gi>
        </n-grid>
      </n-form>
    </n-card>
  </n-flex>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { userStatusEnum, genderEnum } from '@/constants';
import { useFormRules, useNaiveForm } from '@/hooks';

defineOptions({
  name: 'TableSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}
const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Record<string, any>>('model', { required: true });

const collapsed = ref(false);

// 获取n-tree滚动区高度
const { height: treeHeight } = useElementSize(formRef);

const rules = computed(() => {
  const { patternRules } = useFormRules(); // inside computed to make locale reactive

  return {
    email: patternRules.email,
    phone: patternRules.phone
  };
});

async function reset() {
  await restoreValidation();
  emit('reset');
}

async function search() {
  await validate();
  emit('search');
}

const dataTypeOptions = [
  {
    label: '学科数据库',
    value: 0
  },
  {
    label: '汇交数据库',
    value: 1
  },
  {
    label: '其他',
    value: 2
  }
];
const dataSourceOptions = [
  {
    label: '研究所大学中心',
    value: 0
  },
  {
    label: '大学',
    value: 1
  },
  {
    label: '中心',
    value: 2
  }
];
const searchTreeData = [
  {
    label: '全部分类',
    key: '0',
    children: [
      {
        label: '作物科学',
        key: '1',
        children: [
          {
            label: '作物种质资源',
            key: '4'
          },
          {
            label: '作物遗传育种',
            key: '5'
          },
          {
            label: '作物栽培与耕作',
            key: '6'
          },
          {
            label: '作物分子生物学',
            key: '7'
          }
        ]
      },
      {
        label: '动物科学与动物医学',
        key: '2',
        children: [
          {
            label: '动物种质资源',
            key: '8'
          },
          {
            label: '动物遗传育种',
            key: '9'
          },
          {
            label: '动物营养与饲养',
            key: '10'
          },
          {
            label: '动物医学',
            key: '11'
          },
          {
            label: '动物生物技术与繁殖',
            key: '12'
          }
        ]
      },
      {
        label: '热作科学',
        key: '3'
      }
    ]
  }
];
const defaultExpandedKeys = ref(['0']);
function handleCheckedKeysChange(checkedKeys: Array<string | number>) {
  model.value.checkedKeys = checkedKeys;
}
</script>

<style scoped></style>
