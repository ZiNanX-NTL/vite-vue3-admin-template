<template>
  <div class="w-full">
    <n-card title="选座" class="size-full">
      <div class="relative size-full">
        <div id="leafer-view" class="absolute-rt size-full"></div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { App, Group, Image, PointerEvent } from 'leafer-ui';
import '@leafer-in/editor';
import '@leafer-in/view';
import '@leafer-in/state';
import { ScrollBar } from '@leafer-in/scroll';
import freeSeat from '@/assets/images/seat_free_2x.png';
import selectedSeat from '@/assets/images/seat_selected_2x.png';
function init() {
  const app = new App({
    view: 'leafer-view',
    editor: {
      selector: false
    }
  });
  app.sky.add(new ScrollBar(app.tree));

  const seatLayout = [
    [1, 0, 1, 1, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
  const seatData = [
    {
      id: '1',
      row: 1,
      col: 1,
      status: '1'
    }
    // {
    //   id: 2,
    //   row: 2,
    //   col: 3,
    //   status: 'free'
    // }
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
  // console.log(renderMap);

  // 绘制座位
  function drawSeats(drawMap: typeof renderMap) {
    const seatList: Image[] = [];
    // 座位大小
    const seatSize = 30;
    // 座位间隔
    const seatGap = 10;

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

  interface DrawOptions {
    x: number;
    y: number;
    seatSize: number;
  }
  function drawSeat(drawOptions: DrawOptions, seat: NonNullable<(typeof renderMap)[0][0]>) {
    const image = new Image({
      x: drawOptions.x,
      y: drawOptions.y,
      width: drawOptions.seatSize,
      height: drawOptions.seatSize,
      url: seat?.status === '1' ? selectedSeat : freeSeat,
      cursor: 'pointer',
      data: {
        seat
      }
    });
    return image;
  }

  const seatList = drawSeats(renderMap);

  const group = new Group({
    draggable: true,
    children: seatList
  });
  app.tree.add(group);

  group.on(PointerEvent.TAP, (e: PointerEvent) => {
    console.log('asdfasdfsad', e.target.data?.seat);
    const seat = e.target.data?.seat as NonNullable<(typeof renderMap)[0][0]>;
    if (!seat) return;
    if ((e.target as Image).url === freeSeat) {
      seat.status = '1';
      (e.target as Image).url = selectedSeat;
      seatData.push(seat);
    } else {
      seat.status = 'free';
      (e.target as Image).url = freeSeat;
      seatData.splice(
        seatData.findIndex(item => seat.row === item.row && seat.col === item.col),
        1
      );
    }
    console.log(seatData);
  });

  setTimeout(() => {
    app.tree.zoom(group, 0, true);
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped></style>
