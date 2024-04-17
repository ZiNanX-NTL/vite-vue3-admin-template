<template>
  <div class="flex-vertical-stretch overflow-hidden">
    <n-card title="测试" class="h-full">
      {{ loading }}
      <div ref="threeMapRef" class="relative size-800px bg-black"></div>

      <CountTo v-slot="{ value }" :end-value="123">
        <p class="mb-4px flex-center">
          <n-gradient-text
            :gradient="{
              from: '#19c6fe',
              to: '#fff'
            }"
            class="text-30px font-600"
          >
            {{ value }}
          </n-gradient-text>
          <n-gradient-text
            :gradient="{
              from: '#19c6fe',
              to: '#fff'
            }"
            class="text-20px font-600"
          >
            {{ `($)` }}
          </n-gradient-text>
        </p>
      </CountTo>
      <div class="aaa box h-500px overflow-auto">
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

      <NCard :bordered="false" class="card-wrapper">
        <div ref="domRef" class="h-360px overflow-hidden"></div>
      </NCard>

      <n-button @click="add">+</n-button>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useEcharts, useThreeMap } from '@/hooks';
const index = ref(1);
function add() {
  index.value += 1;
}

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {},
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [] as string[]
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      color: '#8e9dff',
      name: '下载量',
      type: 'line',
      smooth: true,
      stack: 'Total',
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0.25,
              color: '#8e9dff'
            },
            {
              offset: 1,
              color: '#fff'
            }
          ]
        }
      },
      emphasis: {
        focus: 'series'
      },
      data: [] as number[]
    },
    {
      color: '#26deca',
      name: '注册量',
      type: 'line',
      smooth: true,
      stack: 'Total',
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0.25,
              color: '#26deca'
            },
            {
              offset: 1,
              color: '#fff'
            }
          ]
        }
      },
      emphasis: {
        focus: 'series'
      },
      data: []
    }
  ]
}));

async function mockData() {
  await new Promise(resolve => {
    setTimeout(resolve, 1000);
  });

  updateOptions(opts => {
    opts.xAxis.data = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'];
    opts.series[0].data = [4623, 6145, 6268, 6411, 1890, 4251, 2978, 3880, 3606, 4311];
    opts.series[1].data = [2208, 2016, 2916, 4512, 8281, 2008, 1963, 2367, 2956, 678];

    return opts;
  });
}

// threeMap
const mapData = [
  {
    origFid: 55,
    pointY: 45.7141,
    nums: 2,
    level: 2,
    zcode: '230100',
    pointX: 126.566,
    mc: '哈尔滨市',
    rname: '黑龙江省 哈尔滨市 市区',
    area: '927.68',
    userID: 0
  },
  {
    origFid: 70,
    pointY: 47.4308,
    nums: 2,
    level: 2,
    zcode: '230200',
    pointX: 123.888,
    mc: '齐齐哈尔市',
    rname: '黑龙江省 齐齐哈尔市 市区',
    area: '531.73',
    userID: 0
  },
  {
    origFid: 60,
    pointY: 45.2223,
    nums: 0,
    level: 2,
    zcode: '230300',
    pointX: 130.771,
    mc: '鸡西市',
    rname: '黑龙江省 鸡西市 市区',
    area: '1250.99',
    userID: 0
  },
  {
    origFid: 12,
    pointY: 47.6162,
    nums: 3,
    level: 2,
    zcode: '230400',
    pointX: 130.113,
    mc: '鹤岗市',
    rname: '黑龙江省 鹤岗市 市区',
    area: '110.85',
    userID: 0
  },
  {
    origFid: 39,
    pointY: 46.5247,
    nums: 0,
    level: 2,
    zcode: '230500',
    pointX: 131.262,
    mc: '双鸭山市',
    rname: '黑龙江省 双鸭山市 市区',
    area: '522.71',
    userID: 0
  },
  {
    origFid: 35,
    pointY: 46.3338,
    nums: 0,
    level: 2,
    zcode: '230600',
    pointX: 124.802,
    mc: '大庆市',
    rname: '黑龙江省 大庆市 市区',
    area: '180.06',
    userID: 0
  },
  {
    origFid: null,
    pointY: 47.561,
    nums: 34,
    level: 2,
    zcode: '230700',
    pointX: 129.079,
    mc: '伊春市',
    rname: '黑龙江省 伊春市',
    area: '52.84',
    userID: 0
  },
  {
    origFid: 38,
    pointY: 46.8208,
    nums: 2,
    level: 2,
    zcode: '230800',
    pointX: 130.235,
    mc: '佳木斯市',
    rname: '黑龙江省 佳木斯市 市区',
    area: '494.23',
    userID: 0
  },
  {
    origFid: 50,
    pointY: 45.8795,
    nums: 0,
    level: 2,
    zcode: '230900',
    pointX: 131.391,
    mc: '七台河市',
    rname: '黑龙江省 七台河市 市区',
    area: '30.96',
    userID: 0
  },
  {
    origFid: 63,
    pointY: 44.5672,
    nums: 3,
    level: 2,
    zcode: '231000',
    pointX: 129.638,
    mc: '牡丹江市',
    rname: '黑龙江省 牡丹江市 市区',
    area: '67.78',
    userID: 0
  },
  {
    origFid: null,
    pointY: 49.191,
    nums: null,
    level: 2,
    zcode: '231100',
    pointX: 127.149,
    mc: '黑河市',
    rname: '黑龙江省 黑河市 市区',
    area: '17.95',
    userID: 0
  },
  {
    origFid: null,
    pointY: 46.895,
    nums: null,
    level: 2,
    zcode: '231200',
    pointX: 126.451,
    mc: '绥化市',
    rname: '黑龙江省 绥化市 市区',
    area: '389.83',
    userID: 0
  },
  {
    origFid: null,
    pointY: 52.418,
    nums: null,
    level: 2,
    zcode: '232700',
    pointX: 124.188,
    mc: '大兴安岭地区',
    rname: '黑龙江省 大兴安岭地区',
    area: 43,
    userID: 0
  }
];
const { domRef: threeMapRef, ThreeMap, loading } = useThreeMap(mapData);

async function init() {
  mockData();
}
init();

onMounted(() => {
  const threeMap = new ThreeMap();
  threeMap.render();
});
</script>

<style lang="scss" scoped>
.aaa {
  @include scrollbar(8px, #e1e1e1);
  color: $xtxColor;
}
</style>
