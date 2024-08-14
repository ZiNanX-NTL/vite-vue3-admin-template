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
import { App, Group, Image, Rect, Box, PointerEvent, ZoomEvent, MoveEvent } from 'leafer-ui';
import '@leafer-in/editor';
import '@leafer-in/view';
import '@leafer-in/state';
import { ScrollBar } from '@leafer-in/scroll';
import { useThemeStore } from '@/store';
import freeSeat from '@/assets/images/seat_free_2x.png';
import selectedSeat from '@/assets/images/seat_selected_2x.png';

const themeStore = useThemeStore();
let scroll: ScrollBar;
function init() {
  const app = new App({
    view: 'leafer-view',
    editor: {
      selector: false
    },
    ground: { type: 'custom' },
    move: { drag: 'auto', dragAnimate: true }
  });
  console.log(app.ground.width);
  app.ground.zIndex = 100;
  scroll = new ScrollBar(app, { theme: themeStore.darkMode ? 'dark' : 'light' });

  // 座位大小
  const seatSize = 30;
  // 座位间隔
  const seatGap = 10;
  // 刻度尺宽
  const rulerItemWidth = 15;
  // 刻度尺高
  const rulerItemHeight = 15;
  /**
   * 座位布局
   * 0 表示不可用
   * 1 表示可用
   */
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

  // 绘制编号标尺
  function drawRuler() {
    const rulerBg: Rect[] = [];
    const xRulerList: Rect[] = [];
    const yRulerList: Rect[] = [];
    let startY = (seatSize - rulerItemHeight) / 2;
    let startX = (seatSize - rulerItemWidth) / 2;
    seatLayout.forEach((row, rowIndex) => {
      if (rowIndex === 0) {
        row.forEach((_col, colIndex) => {
          const colRuler = createRuler(startX, 0, String(colIndex + 1));
          xRulerList.push(colRuler);
          startX += seatSize + seatGap;
        });
        const colRulerBg = createRulerBg('xBg', app.ground.width, rulerItemHeight);
        rulerBg.push(colRulerBg);
      }
      const rowRuler = createRuler(0, startY, String(rowIndex + 1));
      yRulerList.push(rowRuler);
      startY += seatSize + seatGap;
    });
    const rowRulerBg = createRulerBg('yBg', rulerItemWidth, app.ground.height);
    rulerBg.push(rowRulerBg);

    return [rulerBg, xRulerList, yRulerList];
  }

  /** 创建标尺刻度项 */
  function createRuler(x?: number, y?: number, text?: string) {
    const ruler = new Box({
      x,
      y,
      fill: 'rgb(50,205,121)',
      cornerRadius: 5,
      width: rulerItemWidth,
      height: rulerItemHeight,
      children: [
        {
          x: rulerItemWidth / 2,
          y: rulerItemHeight / 2,
          tag: 'Text',
          text,
          fontSize: 10,
          fill: 'black',
          textAlign: 'center',
          verticalAlign: 'middle'
        }
      ]
    });
    return ruler;
  }
  /** 绘制标尺背景 */
  function createRulerBg(id?: string, width?: number, height?: number) {
    const rulerBg = new Rect({
      id,
      x: 0,
      y: 0,
      width,
      height,
      fill: '#fff'
    });
    return rulerBg;
  }

  // 绘制座位
  function drawSeats(drawMap: typeof renderMap) {
    const seatList: Image[] = [];

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

  // 绘制标尺
  const [rulerBg, xRulerList, yRulerList] = drawRuler();
  const rulerBgGroup = new Group({
    children: rulerBg
  });
  const xRulerGroup = new Group({
    children: xRulerList
  });
  const yRulerGroup = new Group({
    children: yRulerList
  });
  app.ground.add(rulerBgGroup);
  app.ground.add(xRulerGroup);
  app.ground.add(yRulerGroup);

  // 绘制座位
  const seatList = drawSeats(renderMap);
  const group = new Group({
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

  // 自定义ground移动缩放操作
  app.ground.on(ZoomEvent.BEFORE_ZOOM, (e: ZoomEvent) => {
    const xBg = rulerBgGroup.findId('xBg');
    const yBg = rulerBgGroup.findId('yBg');
    if (xBg && yBg) {
      xBg.height! *= e.scale;
      yBg.width! *= e.scale;
    }
    const centerX = { x: e.x, y: 0 };
    xRulerGroup.scaleOfWorld(centerX, e.scale);
    const centerY = { x: 0, y: e.y };
    yRulerGroup.scaleOfWorld(centerY, e.scale);
  });
  app.ground.on(MoveEvent.BEFORE_MOVE, (e: MoveEvent) => {
    xRulerGroup.moveWorld(e.moveX, 0);
    yRulerGroup.moveWorld(0, e.moveY);
  });

  // 更新ruler位置
  function updateRulerPosition() {
    const groupBoundsData = group.getBounds();
    rulerBgGroup.scale = app.tree.scale!;
    xRulerGroup.x = groupBoundsData.x;
    yRulerGroup.y = groupBoundsData.y;
    xRulerGroup.scale = app.tree.scale!;
    yRulerGroup.scale = app.tree.scale!;
  }

  setTimeout(() => {
    app.tree.zoom(group, 0, true);
    updateRulerPosition();
  });
  setTimeout(() => {
    app.tree.zoom('in');
    updateRulerPosition();
  }, 3000);
}

watch(
  () => themeStore.darkMode,
  newValue => {
    if (newValue) {
      scroll?.changeTheme('dark');
    } else {
      scroll?.changeTheme('light');
    }
  }
);

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped></style>
