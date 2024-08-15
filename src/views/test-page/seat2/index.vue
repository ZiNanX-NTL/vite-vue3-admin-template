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
import type { Text } from 'leafer-ui';
import { App, Group, Image, Box, PointerEvent, ZoomEvent, MoveEvent } from 'leafer-ui';
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
    const rulerBg = drawRulerBg();
    const rulerBgGroup = new Group({
      id: 'rulerBgGroup',
      children: rulerBg
    });
    app.ground.add(rulerBgGroup);

    const [xRulerList, yRulerList] = drawRulerScale();
    const xRulerGroup = new Group({
      id: 'xRulerGroup',
      children: xRulerList
    });
    const yRulerGroup = new Group({
      id: 'yRulerGroup',
      children: yRulerList
    });
    app.ground.add(xRulerGroup);
    app.ground.add(yRulerGroup);
  }
  /** 绘制标尺背景 */
  function drawRulerBg() {
    const rulerBg: Box[] = [];
    seatLayout.forEach((_row, rowIndex) => {
      if (rowIndex === 0) {
        const colRulerBg = createRulerBg({
          id: 'xBg',
          width: app.ground.width,
          height: rulerItemHeight
        });
        rulerBg.push(colRulerBg);
      }
    });
    const rowRulerBg = createRulerBg({
      id: 'yBg',
      width: rulerItemWidth,
      height: app.ground.height
    });
    rulerBg.push(rowRulerBg);
    return rulerBg;
  }

  /** 绘制标尺刻度 */
  function drawRulerScale(fillCallback?: (type: 'row' | 'col', index: number) => string) {
    const xRulerList: Box[] = [];
    const yRulerList: Box[] = [];
    let startY = (seatSize - rulerItemHeight) / 2;
    let startX = (seatSize - rulerItemWidth) / 2;
    seatLayout.forEach((row, rowIndex) => {
      if (rowIndex === 0) {
        row.forEach((_col, colIndex) => {
          const colRuler = createScale(
            { id: `col${colIndex}`, x: startX, y: 0 },
            { text: String(colIndex + 1) },
            () => {
              return fillCallback && fillCallback('col', colIndex);
            }
          );
          xRulerList.push(colRuler);
          startX += seatSize + seatGap;
        });
      }
      const rowRuler = createScale({ id: `row${rowIndex}`, x: 0, y: startY }, { text: String(rowIndex + 1) }, () => {
        return fillCallback && fillCallback('row', rowIndex);
      });
      yRulerList.push(rowRuler);
      startY += seatSize + seatGap;
    });
    return [xRulerList, yRulerList];
  }

  /** 创建标尺刻度项 */
  function createScale(
    boxOptions?: ConstructorParameters<typeof Box>[0],
    textOptions?: ConstructorParameters<typeof Text>[0],
    fillCallback: () => string | undefined = () => undefined
  ) {
    const ruler = new Box({
      x: 0,
      y: 0,
      fill: fillCallback() || 'rgb(50,205,121)',
      cornerRadius: 5,
      width: rulerItemWidth,
      height: rulerItemHeight,
      ...boxOptions,
      children: [
        {
          x: rulerItemWidth / 2,
          y: rulerItemHeight / 2,
          tag: 'Text',
          fontSize: 10,
          fill: 'black',
          textAlign: 'center',
          verticalAlign: 'middle',
          ...textOptions
        }
      ]
    });
    return ruler;
  }
  /** 创建标尺背景 */
  function createRulerBg(boxOptions?: ConstructorParameters<typeof Box>[0]) {
    const rulerBg = new Box({
      x: 0,
      y: 0,
      fill: '#fff',
      overflow: 'hide',
      ...boxOptions
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
  drawRuler();

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
      // 选中重新渲染标尺
      updateRulerScale(e.target.data?.seat);
    } else {
      seat.status = 'free';
      (e.target as Image).url = freeSeat;
      seatData.splice(
        seatData.findIndex(item => seat.row === item.row && seat.col === item.col),
        1
      );
      updateRulerScale();
    }
    console.log(seatData);
  });

  // 自定义ground移动缩放操作
  const xRulerGroup = app.ground.findId('xRulerGroup') as Group;
  const yRulerGroup = app.ground.findId('yRulerGroup') as Group;
  app.ground.on(ZoomEvent.BEFORE_ZOOM, (e: ZoomEvent) => {
    const xBg = app.ground.findId('xBg');
    const yBg = app.ground.findId('yBg');
    if (xBg && yBg) {
      xBg.height! *= e.scale;
      yBg.width! *= e.scale;
    }
    if (xRulerGroup) {
      const centerX = { x: e.x, y: 0 };
      xRulerGroup.scaleOfWorld(centerX, e.scale);
    }
    if (yRulerGroup) {
      const centerY = { x: 0, y: e.y };
      yRulerGroup.scaleOfWorld(centerY, e.scale);
    }
  });
  app.ground.on(MoveEvent.BEFORE_MOVE, (e: MoveEvent) => {
    if (xRulerGroup) xRulerGroup.moveWorld(e.moveX, 0);
    if (yRulerGroup) yRulerGroup.moveWorld(0, e.moveY);
  });

  /** 更新选中刻度尺刻度 */
  function updateRulerScale(seat?: NonNullable<(typeof renderMap)[0][0]>) {
    const [xRulerList, yRulerList] = drawRulerScale((type, index) => {
      if (!seat) return '';
      if (type === 'row' && index === seat.row - 1) return 'rgb(255, 0, 0)';
      if (type === 'col' && index === seat.col - 1) return 'rgb(255, 0, 0)';
      return '';
    });
    if (xRulerGroup) {
      xRulerGroup.clear();
      xRulerGroup.addMany(...xRulerList);
    }
    if (yRulerGroup) {
      yRulerGroup.clear();
      yRulerGroup.addMany(...yRulerList);
    }
  }

  // 更新ruler位置
  function updateRulerPosition() {
    const groupBoundsData = group.getBounds();
    const rulerBgGroup = app.ground.findId('rulerBgGroup');
    if (rulerBgGroup) rulerBgGroup.scale = app.tree.scale!;
    if (xRulerGroup) {
      xRulerGroup.x = groupBoundsData.x;
      xRulerGroup.scale = app.tree.scale!;
    }
    if (yRulerGroup) {
      yRulerGroup.y = groupBoundsData.y;
      yRulerGroup.scale = app.tree.scale!;
    }
  }

  setTimeout(() => {
    app.tree.zoom(group, 0, true);
    updateRulerPosition();
  });
  setTimeout(() => {
    app.tree.zoom('in');
    updateRulerPosition();
    updateRulerScale(seatData[0]);
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
