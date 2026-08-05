<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

// 当前时间和日期
const currentTime = ref('');
const currentDate = ref('');

// 格式：xxxx年xx月xx时xx分xx秒 星期x
function complement(value) {
  return value < 10 ? `0${value}` : value;
}

// 时间格式化
function formateDateTime(date) {
  const time = new Date(date);
  const year = time.getFullYear();
  const month = complement(time.getMonth() + 1);
  const day = complement(time.getDate());
  const hour = complement(time.getHours());
  const minute = complement(time.getMinutes());
  const second = complement(time.getSeconds());

  currentTime.value = `${hour}:${minute}:${second}`;
  currentDate.value = `${year}-${month}-${day}`;
}

let timer = null;

// 获取当前时间
function getNowTime() {
  formateDateTime(new Date());
  timer = setInterval(() => {
    formateDateTime(new Date());
  }, 1000);
}

// 清除定时器
function clear() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  currentTime.value = '';
  currentDate.value = '';
}

// 挂载
onMounted(() => {
  getNowTime();
});

// 销毁前
onBeforeUnmount(() => {
  clear();
});
</script>

<template>
  <div class="datetime">
    <span class="date">{{ currentDate }}</span>
    <span class="time">{{ currentTime }}</span>
  </div>
</template>

<style lang="scss" scoped>
.datetime {
  display: flex;
  align-items: flex-end;
  gap: 12px;

  .time {
    color: #ffffff;
    font-size: 16px;
    // font-weight: bold;
    text-shadow: 0 0 5px #c4f3fe;
  }

  .date {
    color: #c4f3fe;
    font-size: 13px;
    opacity: 0.8;
  }
}
</style>
