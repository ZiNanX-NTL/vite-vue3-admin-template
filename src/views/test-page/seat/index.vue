<script setup>
import { fabric } from 'fabric';
import freeSeat from '@/assets/images/seat_free_2x.png';
import selectedSeat from '@/assets/images/seat_selected_2x.png';

/**
 * 组的方法 getObjects() 返回一组中所有对象的数组 size() 所有对象的数量 contains() 检查特定对象是否在group中 item() 组中元素 forEachObject() 遍历组中对象 add()
 * 添加元素对象 remove() 删除元素对象 fabric.util.object.clone()
 * 克隆，详情可看https://blog.csdn.net/qq_43759079/article/details/115357084?spm=1001.2014.3001.5501
 */

let canvas = null;

async function init() {
	canvas = new fabric.Canvas('canvas');
	canvas.selection = false;
	canvas.set('hoverCursor', 'pointer');
	canvas.setDimensions({
		width: 1000,
		height: 600
	});
	const canvasDpr = 2;
	canvas.zoomToPoint(canvas.getVpCenter(), 1 / canvasDpr);

	const seatLayout = [
		[1, 0, 1, 1, 0, 1, 1, 1, 1],
		[0, 0, 1, 1, 1, 1, 1, 0, 0],
		[0, 0, 1, 1, 1, 1, 1, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1]
	];
	const seatData = [
		{
			id: 1,
			row: 1,
			col: 1,
			status: '1'
		}
	];
	const renderMap = seatLayout.map((row, rowIndex) =>
		row.map((col, colIndex) => {
			if (!col) {
				return null;
			}
			const rowId = rowIndex + 1;
			const colId = colIndex + 1;
			const seat = seatData.find(seatItem => seatItem.row === rowId && seatItem.col === colId);
			if (seat) {
				return {
					id: `${rowId}-${colId}`,
					row: rowId,
					col: colId,
					status: seat.status
				};
			}
			return {
				id: `${rowId}-${colId}`,
				row: rowId,
				col: colId,
				status: 'free'
			};
		})
	);

	// 异步加载图片
	function asyncLoadImg(imgURL) {
		return new Promise((resolve, reject) => {
			fabric.util.loadImage(imgURL, img => {
				if (img) {
					resolve(img);
				} else {
					const errorMsg = '图片加载出错啦~';
					reject(errorMsg);
				}
			});
		});
	}

	const img = await asyncLoadImg(freeSeat);
	const img1 = await asyncLoadImg(selectedSeat);
	const pattern = new fabric.Pattern({
		source: img,
		repeat: 'no-repeat'
	});
	const pattern1 = new fabric.Pattern({
		source: img1,
		repeat: 'no-repeat'
	});

	// 绘制座位
	function drawSeats(drawMap) {
		const seatList = [];
		// 座位大小
		const seatSize = 30 * canvasDpr;
		// 座位间隔
		const seatGap = 10 * canvasDpr;

		let currentY = 0;
		drawMap.forEach(row => {
			let currentX = 0;
			row.forEach(seat => {
				if (seat) {
					const seatRect = drawSeat({ x: currentX, y: currentY, seatSize }, seat);
					seatList.push(seatRect);
				}
				currentX += seatSize + seatGap;
			});
			currentY += seatSize + seatGap;
		});

		return seatList;
	}

	function drawSeat(drawOptions, seat) {
		const rect = new fabric.Rect({
			left: drawOptions.x,
			top: drawOptions.y,
			width: drawOptions.seatSize,
			height: drawOptions.seatSize,
			backgroundColor: '#f6f9f8',
			fill: seat.status === '1' ? pattern1 : pattern,
			perPixelTargetFind: false,
			seat
		});
		return rect;
	}

	const seatList = drawSeats(renderMap);

	// 建组
	const group1 = new fabric.Group(seatList, {
		top: 50, // 整组距离顶部100
		left: 100, // 整组距离左侧100
		perPixelTargetFind: true,
		hasBorders: false,
		hasControls: false,
		subTargetCheck: true,
		lockMovementX: true,
		lockMovementY: true
	});

	canvas.centerObject(group1);

	group1.on('mousedown', options => {
		if (options.e.altKey !== true) {
			group1.isClick = true;
		}
	});
	group1.on('mouseup', options => {
		if (!group1.isClick) return;
		group1.isClick = false;

		const target = options.subTargets[0];
		if (target.seat.status === 'free') {
			target.seat.status = '1';
			target.set('fill', pattern1);
			seatData.push(target.seat);
		} else {
			target.seat.status = 'free';
			target.set('fill', pattern);
			seatData.splice(
				seatData.findIndex(item => target.seat.row === item.row && target.seat.col === item.col),
				1
			);
		}
		canvas.renderAll();
		// console.log(seatData);
	});

	canvas.add(group1);

	// 监听鼠标滚轮事件
	canvas.on('mouse:wheel', opt => {
		if (opt.e.altKey !== true) return;
		const delta = opt.e.deltaY; // 滚轮向上滚一下是 -100，向下滚一下是 100
		let zoom = canvas.getZoom(); // 获取画布当前缩放值

		// 控制缩放范围在 0.01~20 的区间内
		zoom *= 0.999 ** delta;
		if (zoom > 20) zoom = 20;
		if (zoom < 0.01) zoom = 0.01;

		// 设置画布缩放比例
		// 关键点！！！
		// 参数1：将画布的所放点设置成鼠标当前位置
		// 参数2：传入缩放值
		canvas.zoomToPoint(
			{
				x: opt.e.offsetX, // 鼠标x轴坐标
				y: opt.e.offsetY // 鼠标y轴坐标
			},
			zoom // 最后要缩放的值
		);
	});

	// 按下鼠标事件
	canvas.on('mouse:down', opt => {
		const evt = opt.e;
		if (evt.altKey === true) {
			canvas.isDragging = true;
			canvas.lastPosX = evt.clientX;
			canvas.lastPosY = evt.clientY;
		}
	});

	// 移动鼠标事件
	canvas.on('mouse:move', opt => {
		if (canvas.isDragging) {
			const e = opt.e;
			const vpt = canvas.viewportTransform;
			vpt[4] += e.clientX - canvas.lastPosX;
			vpt[5] += e.clientY - canvas.lastPosY;
			canvas.requestRenderAll();
			canvas.lastPosX = e.clientX;
			canvas.lastPosY = e.clientY;
		}
	});

	// 松开鼠标事件
	canvas.on('mouse:up', () => {
		canvas.setViewportTransform(canvas.viewportTransform);
		canvas.isDragging = false;
	});
}

onMounted(() => {
	init();
});
</script>

<template>
	<div>
		<canvas id="canvas" class="border-1px border-#ccc"></canvas>
	</div>
</template>

<style lang="scss" scoped></style>
