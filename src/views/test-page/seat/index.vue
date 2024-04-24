<template>
  <div>
    <div class="seat-plan">
      <canvas ref="canvas" class="cursor-pointer" :width="canvasWidth" :height="canvasHeight"></canvas>
    </div>
  </div>
</template>

<script setup>
import { useEventListener } from '@vueuse/core';

const canvas = ref(null);
const ctx = ref(null);
const seatLayout = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9],
  [10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19]
]; // 用于表示每一行的座位数量
const seatData = seatLayout.map((row, rowIndex) =>
  row.map((_col, colIndex) => ({
    id: `${rowIndex}-${colIndex}`,
    row: rowIndex,
    col: colIndex,
    status: false
  }))
);

const canvasWidth = 800; // 画布宽度
const canvasHeight = 400; // 画布高度
let seatSize = 30; // 座位大小
const seatGap = 10; // 座位间隙
let layoutOffsetX = 10; // 座位布局的水平偏移值
let layoutOffsetY = 10; // 座位布局的垂直偏移值
let isDragging = false;

// 用于记录选中的座位
const selectedSeats = ref([]);

// 优化：将座位绘制的样式参数化
const seatStyle = {
  fillColor: '#999',
  selectedFillColor: 'red',
  strokeColor: '#000',
  lineWidth: 1
};

onMounted(() => {
  const canvasElement = canvas.value;
  try {
    ctx.value = canvasElement.getContext('2d');
    drawSeats();

    setupEventListeners();
  } catch (error) {
    console.error("Failed to getContext('2d') for canvas:", error);
  }
});

function setupEventListeners() {
  useEventListener(ctx.value.canvas, 'click', handleSeatClick);
  useEventListener(ctx.value.canvas, 'wheel', handleWheelZoom);
  useEventListener(ctx.value.canvas, 'mousedown', handleMouseDown);
  useEventListener(ctx.value.canvas, 'mousemove', handleMouseMove);
  useEventListener(window, 'mouseup', handleMouseUp);
}

function handleSeatClick(event) {
  const rect = ctx.value.canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  if (isSeatClicked(clickX, clickY)) {
    const rowIndex = Math.floor((clickY - layoutOffsetY) / (seatSize + seatGap));
    const colIndex = Math.floor((clickX - layoutOffsetX) / (seatSize + seatGap));
    seatData[rowIndex][colIndex].status = !seatData[rowIndex][colIndex].status;
    selectedSeats.value = seatData
      .flat()
      .filter(seat => seat.status)
      .map(seat => seat.id);
    // 重新绘制
    drawSeats();
    // 座位点击逻辑
    console.log('Seat clicked', selectedSeats.value);
  }
}

function handleWheelZoom(event) {
  event.preventDefault(); // 阻止默认的滚轮滚动行为（如页面滚动）

  const delta = Math.max(-1, Math.min(1, event.deltaY)); // 取得滚轮滚动方向（-1：向上，1：向下）
  const sizeChange = delta > 0 ? -1 : 1; // 根据滚轮滚动方向设置缩放变化量

  seatSize += sizeChange; // 更新缩放比例
  drawSeats(); // 重绘座位以应用缩放
}

// 布局顶点其实位置
let layoutX = layoutOffsetX;
let layoutY = layoutOffsetY;
// 鼠标按下起始位置
let startX = 0;
let startY = 0;

function handleMouseDown(event) {
  if (event.button === 0) {
    // 检查是否是左键按下
    isDragging = true;
    const rect = ctx.value.canvas.getBoundingClientRect();
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
  }
}

function handleMouseMove(event) {
  if (isDragging) {
    const rect = ctx.value.canvas.getBoundingClientRect();
    const endX = event.clientX - rect.left;
    const endY = event.clientY - rect.top;

    layoutOffsetX = layoutX + endX - startX;
    layoutOffsetY = layoutY + endY - startY;

    requestAnimationFrame(drawSeats);
  }
}

function handleMouseUp() {
  isDragging = false;
  layoutX = layoutOffsetX;
  layoutY = layoutOffsetY;
}

function drawSeats() {
  const context = ctx.value;
  if (!context) return; // 异常处理

  renderSeats();
}

// 优化：拆分绘制逻辑，提高代码的可维护性
function renderSeats() {
  const context = ctx.value;
  context.clearRect(0, 0, canvasWidth, canvasHeight);

  let currentY = layoutOffsetY;
  seatData.forEach(row => {
    let currentX = layoutOffsetX;
    row.forEach(seat => {
      drawSeat(currentX, currentY, seat);
      currentX += seatSize + seatGap;
    });
    currentY += seatSize + seatGap;
  });
}

function drawSeat(x, y, seat) {
  const context = ctx.value;
  context.fillStyle = seat.status ? seatStyle.selectedFillColor : seatStyle.fillColor;
  context.strokeStyle = seatStyle.strokeColor;
  context.lineWidth = seatStyle.lineWidth;
  context.fillRect(x, y, seatSize, seatSize);
  context.strokeRect(x, y, seatSize, seatSize);
}

// 辅助函数：判断点击是否在座位上
function isSeatClicked(x, y) {
  const seatWidth = seatSize;
  return seatLayout.some((row, rowIndex) => {
    const start = layoutOffsetY + rowIndex * (seatSize + seatGap);
    return row.some((_, colIndex) => {
      const seatStartX = layoutOffsetX + colIndex * (seatSize + seatGap);
      return x >= seatStartX && x <= seatStartX + seatWidth && y >= start && y <= start + seatSize;
    });
  });
}
</script>

<style>
.seat-plan {
  overflow: auto;
  position: relative;
  border: 1px solid #ccc;
}
</style>
