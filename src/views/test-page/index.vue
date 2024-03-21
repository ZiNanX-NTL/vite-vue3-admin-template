<template>
  <div class="flex-vertical-stretch overflow-hidden">
		<n-card title="测试" class="h-full">
			<div class="h-500px overflow-auto aaa box">

				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
				<div>测试{{ index }}</div>
			</div>

			<n-button @click="add">+</n-button>
		</n-card>
  </div>
</template>

<script setup>
const index = ref(1);
function add() {
  index.value += 1;
}
</script>

<style lang="scss" scoped>
.aaa {
  @include scrollbar(8px, #e1e1e1);
	color: $xtxColor
}
</style>
