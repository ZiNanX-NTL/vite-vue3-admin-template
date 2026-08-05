<script setup>
import {
  CameraControls,
  OrbitControls,
  Stars,
  useProgress
} from '@tresjs/cientos';
import { TresCanvas, useRenderLoop, vLightHelper } from '@tresjs/core';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { gsap } from 'gsap';
// import { dateZhCN, zhCN } from 'naive-ui';
import { NoToneMapping, SRGBColorSpace } from 'three';
import { Pane } from 'tweakpane';
import { nextTick, onMounted, reactive, ref, watch } from 'vue';
import HLJZoneFull from '@/assets/json/HLJZone_full.json?url';
import HLJZoneSimple2 from '@/assets/json/HLJZone_simple2.json?url';
import { loadGeojson } from '@/utils';
import BarChart3D2 from './business/BarChart3D2.vue';
import BarChart3D3 from './business/BarChart3D3.vue';
import BarChart3D from './business/BarChart3D.vue';
import FlyLine from './business/FlyLine.vue';
import HeatmapJS from './business/HeatmapJS.vue';
import MapTabs from './business/MapTabs.vue';
import NetTabs from './business/NetTabs.vue';
import DigitalGround1 from './components/DigitalGround1.vue';
import DigitalGround from './components/DigitalGround.vue';

import HeiLongJiangMapMesh from './components/HeiLongJiangMapMesh.vue';
import ImgGround from './components/ImgGround.vue';

import Loading from './components/Loading.vue';
import MapBoundary from './components/MapBoundary.vue';
import ReflectorGround from './components/ReflectorGround.vue';
import StreamLine from './components/StreamLine.vue';
import UpParticles from './components/UpParticles.vue';
// import MapTabs from './components/MapTabs.vue'
// import HeatmapJS from './components/HeatmapJS.vue'
// import BarChart3D from './components/BarChart3D.vue'
// import FlyLine from './components/FlyLine.vue'
import { getLinePoints } from './utils/index.js';
import { geoMercatorForCenter } from './utils/index.js';

const props = defineProps({
  markData: {
    type: Array,
    default: () => pointList
  },
  heatmapData: {
    type: Array,
    default: () => pointList
  },
  occurrenceAreaData: {
    type: Array,
    default: () => pointList
  },
  netMarkData: {
    type: Array,
    default: () => pointList
  },
  occurrenceAreaData2: {
    type: Array,
    default: () => pointList
  },
  flyLines: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'cameraAnimationComplete',
  'point-click',
  'back-parent'
]);

const { hasFinishLoading, progress } = await useProgress();
const { onBeforeLoop, onAfterLoop } = useRenderLoop();

// 相机引用和初始位置
const cameraRef = shallowRef();
const cameraInitialPosition = [-400, 80, 500]; // 初始远距离位置
const cameraFinalPosition = [0, 60, 60]; // 最终位置

// 地图引用
const boxMesh = useTemplateRef('boxMeshRef');

// 控制器引用
const controlsRef = useTemplateRef('controlsRef');

const state = reactive({
  clearColor: '#000',
  // 色调设置为three.js默认值
  toneMapping: NoToneMapping,
  outputColorSpace: SRGBColorSpace
});

const controlsState = reactive({
  minPolarAngle: 0,
  maxPolarAngle: Math.PI / 2.2
});

const directionalLightPositions = [
  [100, -100, -100],
  // [-100, -100, -100],
  // [100, -100, 100],
  [-100, -100, 100]
];

const digitalState = reactive({
  color: '#37a2fa',
  speed: 3,
  size: 100
});

const pointImgSrcPath = new URL(
  '@/assets/image/floor/circle-point.png',
  import.meta.url
).href;
const imgSrcPath = new URL(
  '@/assets/image/floor/rotatingAperture.png',
  import.meta.url
).href;
const imgSrcPath1 = new URL(
  '@/assets/image/floor/rotating-point2.png',
  import.meta.url
).href;
// const imgSrcPath2 = new URL(
//   '@/assets/image/floor/rotating5.png',
//   import.meta.url
// ).href
const imgPointGroundState = reactive({
  size: [90, 90],
  imgSrcPath: pointImgSrcPath,
  color: '#fff',
  opacity: 1,
  rotationSpeed: 0
});
const imgGroundState = reactive({
  size: [90, 90],
  imgSrcPath,
  color: '#fff',
  opacity: 1,
  rotationSpeed: 0.0005
});
const imgGroundState1 = reactive({
  size: [80, 80],
  imgSrcPath: imgSrcPath1,
  color: '#fff',
  opacity: 1,
  rotationSpeed: -0.0005
});
// const imgGroundState2 = reactive({
//   size: [100, 100],
//   imgSrcPath: imgSrcPath2,
//   color: '#fff',
//   opacity: 1,
//   rotationSpeed: 0.005,
// })

// 流光线
const linePath = await getLinePoints(HLJZoneFull);
const streamLineState = reactive({
  color: '#5dc3f4',
  radius: 0.4,
  speed: 0.6,
  tubularSegments: 1000,
  radialSegments: 6,
  closed: true,
  clockwise: true,
  fewNum: 2,
  linesList: linePath
});

const reflectorState = reactive({
  reflectivity: 0.8,
  showGridHelper: false,
  size: [100, 100],
  scale: 1.5
});

const mapExtrudeSettings = reactive({
  depth: 4,
  bevelEnabled: true,
  bevelSegments: 0,
  bevelThickness: 0.2,
  // 正面材质
  frontColor: '#00d7fd',
  // frontColor: '#26a4f0',
  frontEmissive: '#000',
  frontEmissiveIntensity: 1.0,
  // 添加贴图参数
  textureOffset: {
    x: 0.518,
    y: 0.377
  },
  textureScale: 0.0142,
  // 添加渐变颜色控制
  sideLightIntensity: 1.5, // 侧边整体发光强度
  gradientTopColor: '#9ecbff',
  gradientBottomColor: '#001122',
  // 添加透明度控制
  opacity: 1.0,
  // 添加流光效果控制
  flowEnabled: true,
  flowDirection: 1, // 1: 向上流动，-1: 向下流动
  flowScale: 2,
  flowSpeed: 0.3,
  // flowIntensity: 0.65,
  flowIntensity: 0.05,
  flowWidth: 1,
  flowColor: '#b0e2ff',
  // 地图标注
  fontScale: 0.07
});

const htmlState = reactive({
  wrapperClass: 'wrapper',
  center: true,
  sprite: true,
  prepend: true,
  transform: true,
  distanceFactor: 10
});

// 热力图状态
const heatmapState = reactive({
  heightRatio: 2,
  show2dCanvas: false,
  valueScale: 100, // 热力图数值缩放因子
  maxValue: 10 // 热力图最大值
});

// 柱状图状态
const barChartState = reactive({
  maxHeight: 15,
  baseRadius: 0.4,
  topColor: '#ffffff',
  bottomColor: '#60fffb',
  opacity: 0.9,
  animationDuration: 2,
  segments: 16,
  glowIntensity: 2.0,
  glowColor: '#ffffff',
  showLabels: true,
  showRipples: true,
  rippleColor: '#99d5ff',
  rippleCount: 2,
  rippleWidth: 0.1,
  rippleFadeOut: true,
  rippleFadeEdges: false
});

// 边界线状态配置
const boundaryState = reactive({
  color: '#ffffff',
  lineWidth: 5,
  boundaryPoints: linePath // 使用和流光线相同的路径
});

const streamLineState1 = reactive({
  color: '#56ffff',
  radius: 0.4,
  speed: 1,
  tubularSegments: 1000,
  radialSegments: 20,
  closed: true,
  clockwise: true,
  fewNum: 1,
  linesList: linePath
});

// 光照状态
const lightState = reactive({
  intensity: 1.6,
  color: '#01e6fd'
});

// 飞线状态
const flyLineState = reactive({
  color: '#ffffff',
  radius: 1,
  tubularSegments: 200,
  radialSegments: 2,
  transparent: true,
  opacity: 1.0,
  doubleSide: true,
  repeat: {
    x: 1.6,
    y: 2
  },
  speed: 1,
  closed: false,
  isReverse: false,
  texture: 'flyLine6.png',
  showLabels: true
});

/** 创建一个Tweakpane窗格 */
function createPane() {
  // 添加面板控制
  const pane = new Pane({
    title: '参数',
    expanded: false,
    container: document.getElementById('pane-container')
  });
  // tp-rotv_c设置最高高度
  pane.element.querySelector('.tp-rotv_c').style.maxHeight = '70vh';
  pane.element.querySelector('.tp-rotv_c').style.overflowY = 'auto';

  pane.registerPlugin(EssentialsPlugin);
  const fpsGraph = pane.addBlade({
    view: 'fpsgraph',
    label: '渲染帧率',
    rows: 2
  });
  onBeforeLoop(() => {
    fpsGraph.begin();
  });
  onAfterLoop(() => {
    fpsGraph.end();
  });

  const imgGround = pane.addFolder({
    title: '图像地面参数',
    expanded: true
  });
  imgGround.addBinding(imgGroundState, 'color', { label: '颜色' });
  // imgGround.addBinding(imgGroundState, 'size', { label: '大小' })
  imgGround.addBinding(imgGroundState, 'opacity', { label: '透明度' });
  imgGround.addBinding(imgGroundState, 'rotationSpeed', { label: '旋转速度' });

  // 流光线参数
  const streamLine = pane.addFolder({
    title: '流光线参数',
    expanded: true
  });
  streamLine.addBinding(streamLineState, 'color', { label: '颜色' });
  streamLine.addBinding(streamLineState, 'radius', {
    label: '管道半径',
    min: 0.01,
    max: 1,
    step: 0.01
  });
  streamLine.addBinding(streamLineState, 'speed', {
    label: '跑动速度',
    min: 0.1,
    max: 10,
    step: 0.1
  });
  streamLine.addBinding(streamLineState, 'fewNum', {
    label: '流线数量',
    min: 1,
    max: 10,
    step: 1
  });

  const ground = pane.addFolder({
    title: '场地参数',
    expanded: true
  });
  ground.addBinding(digitalState, 'color', { label: '颜色' });
  ground.addBinding(digitalState, 'speed', { label: '动画速度' });
  ground.addBinding(digitalState, 'size', { label: '纹理大小' });
  ground.addBinding(reflectorState, 'reflectivity', {
    label: '反射率',
    min: 0.1,
    max: 1,
    step: 0.1
  });

  const mapPane = pane.addFolder({
    title: '地图参数',
    expanded: true
  });
  mapPane.addBinding(mapExtrudeSettings, 'depth', { label: '地图厚度' });

  // 添加正面材质控制
  const frontPane = mapPane.addFolder({
    title: '正面材质',
    expanded: true
  });
  frontPane.addBinding(mapExtrudeSettings, 'frontColor', { label: '颜色' });
  frontPane.addBinding(mapExtrudeSettings, 'frontEmissive', {
    label: '自发光颜色'
  });
  frontPane.addBinding(mapExtrudeSettings, 'frontEmissiveIntensity', {
    label: '自发光强度',
    min: 0,
    max: 1,
    step: 0.1
  });

  // 添加贴图参数控制
  const texturePane = frontPane.addFolder({
    title: '贴图设置',
    expanded: true
  });
  texturePane.addBinding(mapExtrudeSettings, 'textureOffset', {
    label: '位置',
    x: { min: -2.0, max: 2.0, step: 0.001, inverted: true },
    y: { min: -2.0, max: 2.0, step: 0.001 }
  });
  texturePane.addBinding(mapExtrudeSettings, 'textureScale', {
    label: '缩放',
    min: 0.0001,
    max: 0.1,
    step: 0.0001
  });

  // 添加渐变颜色控制
  const gradientPane = mapPane.addFolder({
    title: '侧面渐变',
    expanded: true
  });
  gradientPane.addBinding(mapExtrudeSettings, 'sideLightIntensity', {
    label: '侧边亮度',
    min: 0.1,
    max: 3.0,
    step: 0.1
  });
  gradientPane.addBinding(mapExtrudeSettings, 'gradientTopColor', {
    label: '顶部颜色'
  });
  gradientPane.addBinding(mapExtrudeSettings, 'gradientBottomColor', {
    label: '底部颜色'
  });
  // 添加透明度控制
  gradientPane.addBinding(mapExtrudeSettings, 'opacity', {
    label: '透明度',
    min: 0.1,
    max: 1.0,
    step: 0.1
  });

  // 添加流光效果控制
  const flowPane = gradientPane.addFolder({
    title: '流光效果',
    expanded: true
  });
  flowPane.addBinding(mapExtrudeSettings, 'flowEnabled', {
    label: '启用流光'
  });
  flowPane.addBinding(mapExtrudeSettings, 'flowDirection', {
    label: '流光方向',
    options: {
      向上流动: 1,
      向下流动: -1
    }
  });
  flowPane.addBinding(mapExtrudeSettings, 'flowScale', {
    label: '路径比例',
    min: 0.1,
    max: 2.0,
    step: 0.1
  });
  flowPane.addBinding(mapExtrudeSettings, 'flowSpeed', {
    label: '流光速度',
    min: 0.1,
    max: 2.0,
    step: 0.1
  });
  flowPane.addBinding(mapExtrudeSettings, 'flowIntensity', {
    label: '流光强度',
    min: 0.0,
    max: 1.0,
    step: 0.05
  });
  flowPane.addBinding(mapExtrudeSettings, 'flowWidth', {
    label: '流光宽度',
    min: 0.05,
    max: 2.0,
    step: 0.05
  });
  flowPane.addBinding(mapExtrudeSettings, 'flowColor', { label: '流光颜色' });

  const tabsPane = pane.addFolder({
    title: '标签参数',
    expanded: true
  });
  tabsPane.addBinding(htmlState, 'distanceFactor', { label: '缩放系数' });

  const heatmapPane = pane.addFolder({
    title: '热力图参数',
    expanded: true
  });
  heatmapPane.addBinding(heatmapState, 'heightRatio', { label: '高度比例' });
  heatmapPane.addBinding(heatmapState, 'show2dCanvas', {
    label: '显示2D画布'
  });
  heatmapPane.addBinding(heatmapState, 'valueScale', {
    label: '数值缩放因子',
    min: 1,
    max: 1000,
    step: 1
  });
  heatmapPane.addBinding(heatmapState, 'maxValue', {
    label: '热力图最大值',
    min: 1,
    max: 100,
    step: 1
  });

  const barChartPane = pane.addFolder({
    title: '柱状图参数',
    expanded: true
  });
  barChartPane.addBinding(barChartState, 'maxHeight', {
    label: '最大高度',
    min: 5,
    max: 30,
    step: 1
  });
  barChartPane.addBinding(barChartState, 'baseRadius', {
    label: '底面半径',
    min: 0.1,
    max: 3,
    step: 0.1
  });
  barChartPane.addBinding(barChartState, 'topColor', { label: '顶部颜色' });
  barChartPane.addBinding(barChartState, 'bottomColor', { label: '底部颜色' });
  barChartPane.addBinding(barChartState, 'glowColor', { label: '发光颜色' });
  barChartPane.addBinding(barChartState, 'opacity', {
    label: '透明度',
    min: 0.1,
    max: 1,
    step: 0.1
  });
  barChartPane.addBinding(barChartState, 'glowIntensity', {
    label: '发光强度',
    min: 0.5,
    max: 5,
    step: 0.1
  });
  barChartPane.addBinding(barChartState, 'animationDuration', {
    label: '动画时长',
    min: 0.5,
    max: 5,
    step: 0.1
  });
  barChartPane.addBinding(barChartState, 'showLabels', { label: '显示标签' });
  barChartPane.addBinding(barChartState, 'showRipples', { label: '显示涟漪' });

  // 添加涟漪参数控制
  const ripplePane = barChartPane.addFolder({
    title: '涟漪参数',
    expanded: false
  });
  ripplePane.addBinding(barChartState, 'rippleColor', { label: '涟漪颜色' });
  ripplePane.addBinding(barChartState, 'rippleCount', {
    label: '涟漪条数',
    min: 1,
    max: 5,
    step: 1
  });
  ripplePane.addBinding(barChartState, 'rippleWidth', {
    label: '涟漪宽度',
    min: 0.01,
    max: 1,
    step: 0.01
  });
  ripplePane.addBinding(barChartState, 'rippleFadeOut', { label: '渐变消失' });
  ripplePane.addBinding(barChartState, 'rippleFadeEdges', {
    label: '两端渐变'
  });

  // 边界线参数
  const boundaryPane = pane.addFolder({
    title: '边界线参数',
    expanded: true
  });
  boundaryPane.addBinding(boundaryState, 'color', { label: '边界颜色' });
  boundaryPane.addBinding(boundaryState, 'lineWidth', {
    label: '线条宽度',
    min: 1,
    max: 20,
    step: 1
  });

  // 光照强度
  const lightPane = pane.addFolder({
    title: '光照参数',
    expanded: true
  });
  lightPane.addBinding(lightState, 'color', { label: '光照颜色' });
  lightPane.addBinding(lightState, 'intensity', {
    label: '光照强度',
    min: 0,
    max: 10,
    step: 0.1
  });

  // 飞线参数
  const flyLine = pane.addFolder({
    title: '飞线参数',
    expanded: true
  });
  flyLine.addBinding(flyLineState, 'color', { label: '颜色' });
  flyLine.addBinding(flyLineState, 'radius', {
    label: '管道半径',
    min: 0.01,
    max: 1,
    step: 0.01
  });
  flyLine.addBinding(flyLineState, 'speed', {
    label: '跑动速度',
    min: -10,
    max: 10,
    step: 0.1
  });
  flyLine.addBinding(flyLineState, 'tubularSegments', {
    label: '平滑度',
    min: 10,
    max: 1000,
    step: 1
  });
  flyLine.addBinding(flyLineState, 'radialSegments', {
    label: '圆润度',
    min: 2,
    max: 20,
    step: 1
  });
  flyLine.addBinding(flyLineState, 'transparent', { label: '透明' });
  flyLine.addBinding(flyLineState, 'opacity', {
    label: '透明度',
    min: 0.1,
    max: 1.0,
    step: 0.1
  });
  flyLine.addBinding(flyLineState, 'doubleSide', { label: '双面' });
  flyLine.addBinding(flyLineState, 'repeat', {
    label: '贴图重复',
    x: { min: 1, max: 10, step: 0.1 },
    y: { min: 1, max: 2, step: 0.1 }
  });
  flyLine.addBinding(flyLineState, 'texture', {
    label: '贴图路径',
    options: {
      flyLine1: 'flyLine1.png',
      flyLine2: 'flyLine2.png',
      flyLine3: 'flyLine3.png',
      flyLine4: 'flyLine4.png',
      flyLine5: 'flyLine5.png',
      flyLine6: 'flyLine6.png',
      flyLine7: 'flyLine7.png'
    }
  });
  flyLine.addBinding(flyLineState, 'closed', { label: '闭合' });
  flyLine.addBinding(flyLineState, 'isReverse', { label: '反向' });
}

onMounted(() => {
  // createPane()
  // 等待场景加载完成后执行相机动画
  setTimeout(() => {
    if (hasFinishLoading.value) {
      startCameraAnimation();
    } else {
      // 如果还没加载完成，监听加载完成事件
      const unwatch = watch(hasFinishLoading, newVal => {
        if (newVal) {
          startCameraAnimation();
          unwatch();
        }
      });
    }
  }, 1000);
});

// 相机推进动画
function startCameraAnimation() {
  if (cameraRef.value) {
    // 执行推进动画
    gsap.to(cameraRef.value.position, {
      x: cameraFinalPosition[0],
      y: cameraFinalPosition[1],
      z: cameraFinalPosition[2],
      duration: 3, // 动画持续时间3秒
      ease: 'power2.out', // 缓动函数
      onUpdateParams: [cameraRef.value.position],
      onUpdate: position => {
        const { x, y, z } = position;
        controlsRef?.value?.instance.setPosition(...[x, y, z]);
      },
      onComplete: () => {
        console.log('相机推进动画完成');
        emit('cameraAnimationComplete');
      }
    });
  }
}

// 添加控制MapTabs显示隐藏的状态
const mapTabsVisible = ref(true);
// 添加控制BarChart显示隐藏的状态
const barChartVisible = ref(true);
// 添加控制热力图显示隐藏的状态
const heatmapVisible = ref(true);
// 添加控制飞线图显示隐藏状态
const flyLineVisible = ref(true);

function handleMapTabsToggle() {
  mapTabsVisible.value = !mapTabsVisible.value;
  barChartState.showLabels = !barChartState.showLabels;
  flyLineState.showLabels = !flyLineState.showLabels;
}
function handleHeatmapToggle() {
  heatmapVisible.value = !heatmapVisible.value;
}
function handleBarChartToggle() {
  barChartVisible.value = !barChartVisible.value;
}
function handleFlyLineToggle() {
  flyLineVisible.value = !flyLineVisible.value;
}

// 地图级别
const currentMapLevel = ref(0);
const mapGeoMercatorOptions = reactive({
  center: [127.84, 47.44], // 地图中心点经纬度
  scale: 250, // 地图缩放比例
  translate: [0, 0] // 地图平移偏移量
});

// 墨卡托投影转换
const projection = computed(() =>
  geoMercatorForCenter(
    mapGeoMercatorOptions.center,
    mapGeoMercatorOptions.scale,
    mapGeoMercatorOptions.translate
  )
);

const currentCityCode = ref(null); // 默认城市代码
const geoCenter = ref([127.84, 47.44]);
function handlePointClick(item) {
  // 处理点击事件
  console.log('点击了点位:', item);
  currentMapLevel.value = 1; // 设置地图级别为1
  currentCityCode.value = item.cityCode; // 设置当前城市代码
  geoCenter.value = [parseFloat(item.x), parseFloat(item.y)]; // 设置地图中心点
  emit('point-click', item); // 触发自定义事件，传递点击的点位数据
}

// 返回上级地图
function handleBackToParent() {
  if (currentMapLevel.value > 0) {
    currentMapLevel.value = 0;
    currentCityCode.value = null;
    emit('back-parent');
  }
}

// 根据cityCode筛选城市数据的函数
function filterCityData(fullData, code) {
  const filteredFeatures = fullData.filter(feature => {
    // 通过 adcode 匹配城市代码
    return feature.properties.adcode.toString().startsWith(code);
  });

  return filteredFeatures;
}

// 监听地图级别,设置对应级别的参数
watch(currentMapLevel, async newLevel => {
  console.log('地图级别变化:', newLevel);
  // 根据地图级别设置对应的参数
  if (newLevel === 0) {
    Object.assign(mapGeoMercatorOptions, {
      center: [127.84, 47.44],
      scale: 250,
      translate: [0, 0]
    });
  } else if (newLevel === 1) {
    Object.assign(mapGeoMercatorOptions, {
      center: geoCenter.value,
      scale: 1000,
      translate: [0, -5]
    });
  }
});
async function handleMapLoaded() {
  const newLevel = currentMapLevel.value;
  // console.log('地图级别变化:', newLevel)
  // 重置镜头位置
  setTimeout(() => {
    if (controlsRef?.value?.instance?.fitToSphere) {
      controlsRef?.value?.instance?.fitToSphere(boxMesh.value.mapGroupRef, true);
    }
  }, 1000);
  // 根据地图级别设置对应的参数
  if (newLevel === 0) {
    // 恢复原始流光线路径
    streamLineState.linesList = linePath;
    // 恢复原始边界线路径
    boundaryState.boundaryPoints = linePath;
    streamLineState1.linesList = linePath;
  } else if (newLevel === 1) {
    // 更新流光线路径为城市级别的数据
    try {
      const fullAreaJson = await loadGeojson(HLJZoneSimple2);
      const cityAreaJson = filterCityData(fullAreaJson, currentCityCode.value);
      const areaJson = cityAreaJson;
      const cityLinePath = [];
      areaJson[0].geometry.coordinates[0].forEach(iOne => {
        // 如果是单个点，可以直接使用 projection.value(iOne) 获取坐标
        // 如果是多点线，可以遍历每个点获取坐标
        if (typeof iOne[0] === 'number') {
          const [x, y] = projection.value(iOne);
          cityLinePath.push([x, 0, y]);
        } else {
          iOne.forEach(lineOne => {
            const [x, y] = projection.value(lineOne);
            cityLinePath.push([x, 0, y]);
          });
        }
      });
      streamLineState.linesList = cityLinePath;
      // 更新边界线路径为城市级别的数据
      boundaryState.boundaryPoints = [[]];
      streamLineState1.linesList = cityLinePath;
    } catch (error) {
      console.warn('城市流光线数据加载失败，使用默认路径:', error);
      // 如果没有城市级别的数据，可以使用一个简化的路径
      streamLineState.linesList = [
        [-20, 0, -20],
        [20, 0, -20],
        [20, 0, 20],
        [-20, 0, 20],
        [-20, 0, -20]
      ];
      boundaryState.boundaryPoints = [[]];
      streamLineState1.linesList = [[]];
    }
  }
}

// 处理网点详情
function handleNetPointDetail(item) {
  // 处理网点详情
  console.log('点位详情:', item);
}

defineExpose({
  handleBackToParent
});
</script>

<template>
  <div>
    <div class="size-full relative">
      <div
        id="pane-container"
        class="w-280px left-400px top-200px absolute z-1"
      />

      <!-- 返回按钮 -->
      <Transition name="fade">
        <div
          v-if="currentMapLevel > 0"
          class="left-400px top-150px absolute z-10"
        >
          <ElButton
            class="back-btn"
            round
            size="small"
            @click="handleBackToParent"
          >
            <i class="ico_back mr-4px !size-20px" /> 返回
          </ElButton>
        </div>
      </Transition>

      <!-- 控制按钮 -->
      <div
        class="flex-center transform bottom-32px left-1/2 fixed z-10 -translate-x-1/2"
      >
        <div class="bottom-tray-arrow">
          <img
            src="@/assets/image/box-bg/bottom-menu-arrow-big.svg"
            alt=""
          ><img
            src="@/assets/image/box-bg/bottom-menu-arrow-small.svg"
            alt=""
          >
        </div>
        <div class="bottom-menu">
          <div
            class="bottom-menu-item"
            :class="{ 'is-active': mapTabsVisible }"
            @click="handleMapTabsToggle"
          >
            <span>标签</span>
          </div>
          <div
            class="bottom-menu-item"
            :class="{ 'is-active': heatmapVisible }"
            @click="handleHeatmapToggle"
          >
            <span>热力图</span>
          </div>
          <div
            class="bottom-menu-item"
            :class="{ 'is-active': barChartVisible }"
            @click="handleBarChartToggle"
          >
            <span>柱状图</span>
          </div>
          <div
            class="bottom-menu-item"
            :class="{ 'is-active': flyLineVisible }"
            @click="handleFlyLineToggle"
          >
            <span>飞线图</span>
          </div>
        </div>
        <div class="bottom-tray-arrow is-reverse">
          <img
            src="@/assets/image/box-bg/bottom-menu-arrow-big.svg"
            alt=""
          ><img
            src="@/assets/image/box-bg/bottom-menu-arrow-small.svg"
            alt=""
          >
        </div>
      </div>

      <!-- <Teleport to="body"> -->
      <Transition name="fade">
        <div
          v-show="!hasFinishLoading"
          class="text-white font-mono bg-black flex-center size-full left-0 top-0 absolute z-100"
        >
          <Loading>
            <div class="text-40px text-nowrap">
              {{ progress }} %
            </div>
          </Loading>
        </div>
      </Transition>
      <!-- </Teleport> -->

      <TresCanvas v-bind="state">
        <!-- 相机 -->
        <TresPerspectiveCamera
          ref="cameraRef"
          :position="cameraInitialPosition"
          :fov="45"
          :near="0.1"
          :far="5000"
          :look-at="[0, 0, 0]"
        />
        <CameraControls ref="controlsRef" v-bind="controlsState" />
        <!-- <TresAxesHelper :args="[30]" /> -->
        <!-- 灯光 -->
        <TresDirectionalLight
          :position="[106.59893798828125, 30, -26.918846130371094]"
          v-bind="lightState"
        />
        <TresDirectionalLight
          :position="[106.59893798828125, 30, -26.918846130371094]"
          v-bind="lightState"
        />
        <TresAmbientLight v-bind="lightState" />
        <!-- <TresDirectionalLight
          v-for="(position, index) in directionalLightPositions"
          :key="index"
          :position="position"
          :intensity="6"
        /> -->

        <!-- 添加背景，修饰元素 -->
        <!-- 添加上升粒子组件 -->
        <Suspense>
          <UpParticles
            :count="16"
            :area="[100, 100, 100]"
            :scale-range="[0.01, 0.05]"
            :speed="0.05"
          />
        </Suspense>
        <!-- 数字地面 -->
        <!-- <Stars /> -->
        <Suspense>
          <StreamLine v-bind="streamLineState" :scale="1.02" />
        </Suspense>
        <Suspense>
          <ImgGround
            :position="[0, 0, -10]"
            :rotation-x="-Math.PI / 2"
            v-bind="imgPointGroundState"
          />
        </Suspense>
        <Suspense>
          <ImgGround
            :position="[0, 0, -10]"
            :rotation-x="-Math.PI / 2"
            v-bind="imgGroundState"
          />
        </Suspense>
        <Suspense>
          <ImgGround
            :position="[0, 0, -10]"
            :rotation-x="-Math.PI / 2"
            v-bind="imgGroundState1"
          />
        </Suspense>
        <!-- <Suspense>
          <ImgGround
            :position="[0, 0, -10]"
            :rotation-x="-Math.PI / 2"
            v-bind="imgGroundState2"
          />
        </Suspense> -->
        <Suspense>
          <DigitalGround
            :position="[0, 0, -10]"
            v-bind="digitalState"
            :rotation-x="-Math.PI / 2"
          />
        </Suspense>
        <!-- <Suspense>
          <DigitalGround1 v-bind="digitalState" :rotation-x="-Math.PI / 2" />
        </Suspense> -->

        <!-- 反射地面 -->
        <!-- <Suspense>
          <ReflectorGround
            :position="[0, -0.5, 0]"
            v-bind="reflectorState"
            :rotation-x="-Math.PI / 2"
          />
        </Suspense> -->

        <Suspense>
          <HeiLongJiangMapMesh
            ref="boxMeshRef"
            :position="[0, 0.05, 0]"
            :rotation-x="-Math.PI / 2"
            :extrude-settings="mapExtrudeSettings"
            :city-code="currentCityCode"
            :geo-mercator-options="mapGeoMercatorOptions"
            @map-loaded="handleMapLoaded"
          />
        </Suspense>
        <!-- 边界线 -->
        <!-- <Suspense>
          <MapBoundary
            v-bind="boundaryState"
            :position="[0, mapExtrudeSettings.depth + 0.2, 0]"
          />
        </Suspense> -->
        <Suspense>
          <StreamLine
            v-bind="streamLineState1"
            :position="[0, mapExtrudeSettings.depth + 0.2, 0]"
          />
        </Suspense>
        <!-- 地图标签 -->
        <MapTabs
          v-if="mapTabsVisible && currentMapLevel === 0"
          :position="[0, mapExtrudeSettings.depth + 1, 0]"
          :rotation-x="-Math.PI / 2"
          :html-state="htmlState"
          :point-list="props.markData"
          @point-click="handlePointClick"
        />
        <!-- 二级区县地图 -->
        <!-- <NetTabs
          v-if="currentMapLevel === 1"
          :position="[0, mapExtrudeSettings.depth + 1, 0]"
          :rotation-x="-Math.PI / 2"
          :html-state="htmlState"
          :point-list="props.netMarkData"
          :city-code="currentCityCode"
          :geo-mercator-options="mapGeoMercatorOptions"
          @point-click="handleNetPointDetail"
        /> -->
        <!-- 热力图 -->
        <HeatmapJS
          v-if="heatmapVisible"
          :position="[0, mapExtrudeSettings.depth, 0]"
          v-bind="heatmapState"
          :point-list="props.heatmapData"
        />
        <!-- 柱状图 -->
        <BarChart3D
          v-if="barChartVisible"
          :position="[0, mapExtrudeSettings.depth + 0.1, 0]"
          v-bind="barChartState"
          :point-list="props.occurrenceAreaData"
        />
        <BarChart3D2
          v-if="barChartVisible && currentMapLevel === 0"
          :position="[0, mapExtrudeSettings.depth + 0.1, 0]"
          v-bind="barChartState"
          :point-list="props.occurrenceAreaData2"
          value-field="oneWormNum"
          @bar-click="handlePointClick"
        />
        <BarChart3D3
          v-if="currentMapLevel === 1"
          v-bind="barChartState"
          :position="[0, mapExtrudeSettings.depth + 0.1, 0]"
          :geo-mercator-options="mapGeoMercatorOptions"
          value-field="oneWormNum"
          :point-list="props.netMarkData"
        />
        <!-- 飞线图 -->
        <Suspense>
          <FlyLine
            v-if="flyLineVisible"
            v-bind="flyLineState"
            :position="[0, mapExtrudeSettings.depth + 0.1, 0]"
            :point-list="props.flyLines"
          />
        </Suspense>
      </TresCanvas>
    </div>
  </div>
</template>

<style scoped lang="scss">
.control-button {
  --green: #87ceeb;
  --grey: #929292;
  font-size: 15px;
  cursor: pointer;
  padding: 4px 20px;
  letter-spacing: 0.06em;
  position: relative;
  font-family: inherit;
  border-radius: 0.6em;
  overflow: hidden;
  transition: all 0.3s;
  line-height: 1.4em;
  border: 2px solid var(--grey);
  background: linear-gradient(
    to right,
    rgba(0, 71, 110, 0.1) 1%,
    transparent 40%,
    transparent 60%,
    rgba(0, 71, 110, 0.1) 100%
  );
  color: var(--grey);
  box-shadow:
    inset 0 0 10px rgba(0, 71, 110, 0.4),
    0 0 9px 3px rgba(0, 71, 110, 0.1);

  &:hover {
    color: #87ceeb;
    box-shadow:
      inset 0 0 10px rgba(0, 71, 110, 0.6),
      0 0 9px 3px rgba(0, 71, 110, 0.2);
  }

  &:before {
    content: '';
    position: absolute;
    left: -4em;
    width: 4em;
    height: 100%;
    top: 0;
    transition: transform 0.4s ease-in-out;
    background: linear-gradient(
      to right,
      transparent 1%,
      rgba(0, 71, 110, 0.1) 40%,
      rgba(0, 71, 110, 0.1) 60%,
      transparent 100%
    );
  }

  &:hover:before {
    transform: translateX(15em);
  }

  &.active {
    background: url('@/assets/image/bottom_bg.min.blue.png');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    color: var(--green);
    box-shadow:
      inset 0 0 15px rgba(0, 71, 110, 0.8),
      0 0 12px 4px rgba(0, 71, 110, 0.3);
    border-color: var(--green);
    transition: all 0.3s ease-in-out;
  }
}
.bottom-tray-arrow {
  display: flex;
  align-items: center;
  height: 30px;
  &.is-reverse {
    transform: scaleX(-1);
  }
  img {
    animation: arrowAnimate 2s ease-in-out infinite;
  }
}

@keyframes arrowAnimate {
  0% {
    transform: translate(0);
  }
  50% {
    transform: translate(100%);
  }
  100% {
    transform: translate(0);
  }
}

.bottom-menu {
  display: flex;
  padding: 0px 20px;
  gap: 12px;
  .bottom-menu-item {
    color: #87ceeb;
    width: 100px;
    height: 32px;
    font-size: 15px;
    letter-spacing: 1.6px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
    pointer-events: all;
    transition: background 0.3s ease;
    background: url('@/assets/image/box-bg/bottom-menu-btn.png') 0% 0% / 100%
      no-repeat;

    &.is-active {
      background: url('@/assets/image/box-bg/bottom-menu-btn-hover.png') 0% 0% /
        100% no-repeat;
    }

    &:hover {
      background: url('@/assets/image/box-bg/bottom-menu-btn-hover.png') 0% 0% /
        100% no-repeat;
    }
  }
}

.back-btn {
  &.el-button:hover {
    background-color: rgba(45, 65, 77, 0.671);
  }
}
</style>
