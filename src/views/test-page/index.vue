<template>
  <div>
    测试{{ index }}
    <n-button @click="add">+</n-button>
  </div>
</template>

<script setup>
const index = ref(1);
function add() {
  index.value += 1;
}
</script>

<style lang="scss" scoped></style>
