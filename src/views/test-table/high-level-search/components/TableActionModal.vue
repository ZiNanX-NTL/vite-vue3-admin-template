<script setup>
import { genderEnum, userStatusEnum } from '@/constants';
import { useFormRules, useNaiveForm } from '@/hooks';

defineOptions({
	name: 'TableActionModal'
});

const props = defineProps({
	operateType: {
		validator(value) {
			// The value must match one of these strings
			return ['add', 'edit'].includes(value);
		},
		required: true
	},
	rowData: {
		type: Object,
		default: null
	}
});

const emit = defineEmits(['submitted']);

const visible = defineModel('visible', { type: Boolean, default: false });

const { formRef, validate, restoreValidation } = useNaiveForm();
const { patternRules, defaultRequiredRule } = useFormRules();

const title = computed(() => {
	const titles = {
		add: '添加用户',
		edit: '编辑用户'
	};
	return titles[props.operateType];
});

const model = reactive(createDefaultModel());

function createDefaultModel() {
	return {
		userName: '',
		gender: null,
		age: null,
		phone: '',
		email: '',
		userStatus: null
	};
}

const rules = {
	userName: defaultRequiredRule,
	userStatus: defaultRequiredRule,
	email: patternRules.email,
	phone: patternRules.phone
};

function handleUpdateModelWhenEdit() {
	if (props.operateType === 'add') {
		Object.assign(model, createDefaultModel());
		return;
	}

	if (props.operateType === 'edit' && props.rowData) {
		Object.assign(model, props.rowData);
	}
}

function closeModal() {
	visible.value = false;
}

async function handleSubmit() {
	await validate();
	// request
	window.$message?.success('更新成功!');
	closeModal();
	emit('submitted');
}

watch(visible, () => {
	if (visible.value) {
		handleUpdateModelWhenEdit();
		restoreValidation();
	}
});
</script>

<template>
	<NModal
		v-model:show="visible"
		preset="card"
		:title="title"
		:segmented="{
			content: true
		}"
		size="small"
		class="w-700px"
	>
		<NForm ref="formRef" :model="model" :rules="rules">
			<NGrid :cols="2" :x-gap="18" responsive="screen" item-responsive class="px-5px">
				<NFormItemGi label="用户名" path="userName">
					<NInput v-model:value="model.userName" placeholder="请输入用户名" />
				</NFormItemGi>
				<NFormItemGi label="邮箱" path="email">
					<NInput v-model:value="model.email" placeholder="请输入邮箱" />
				</NFormItemGi>
				<NFormItemGi label="手机号码" path="phone">
					<NInput v-model:value="model.phone" placeholder="请输入手机号码" />
				</NFormItemGi>
				<NFormItemGi label="用户年龄" path="age">
					<NInputNumber v-model:value="model.age" class="w-full" :precision="0" placeholder="请输入年龄" />
				</NFormItemGi>
				<NFormItemGi label="性别" path="gender">
					<NRadioGroup v-model:value="model.gender">
						<NRadio v-for="item in genderEnum.values" :key="item.value" :value="item.value" :label="item.label" />
					</NRadioGroup>
				</NFormItemGi>
				<NFormItemGi label="用户状态" path="userStatus">
					<NRadioGroup v-model:value="model.userStatus">
						<NRadio v-for="item in userStatusEnum.values" :key="item.value" :value="item.value" :label="item.label" />
					</NRadioGroup>
				</NFormItemGi>
			</NGrid>
		</NForm>
		<template #action>
			<NSpace :size="24" justify="center">
				<NButton class="w-72px" @click="closeModal">取消</NButton>
				<NButton class="w-72px" type="primary" @click="handleSubmit">确定</NButton>
			</NSpace>
		</template>
	</NModal>
</template>

<style scoped></style>
