import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { GeoProjection } from 'd3';
import { geoMercator } from 'd3';
import { gsap } from 'gsap';
import { useEventListener } from '@vueuse/core';
import { getColorPalettes, instantiatedComponent } from '@/utils';
import HLJZone from '@/assets/json/HLJZone.json';
import mapTitleBg from '@/assets/images/map_title_bg.png';
import { LightSweepMaterial } from '../shaders/lightSweep';
import type { ThreeBaseOptions } from '../three';
import { ThreeBase } from '../three';

interface ThreeMapOptions extends ThreeBaseOptions {
  /** 地图数据 */
  mapData: any;
  /** 主题色 */
  themeColor?: string;
  /** 渲染模式 */
  renderMode?: 'normal' | 'light';
}

/** ThreeMap类 */
export class ThreeMap extends ThreeBase {
  threeMap: THREE.Group;

  projection: GeoProjection;

  colorArr: string[];

  HIGHT_COLOR: string;

  options: ThreeMapOptions;

  mapData: any[];

  constructor(
    dom: HTMLElement | null,
    options: ThreeMapOptions = {
      mapData: [],
      themeColor: ''
    }
  ) {
    const { taskLoadStart, taskLoadEnd } = options;
    super(dom, {
      taskLoadStart,
      taskLoadEnd
    });
    this.options = options;
    this.mapData = options.mapData;

    this.threeMap = new THREE.Group();
    // 墨卡托投影转换
    this.projection = geoMercator().center([127.84, 47.44]).scale(250).translate([0, 0]);
    this.colorArr = getColorPalettes(this.options.themeColor || '#1890FF').reverse();
    this.HIGHT_COLOR = this.colorArr[2];
  }

  loadLights() {
    const LIGHT_LIST = [
      [100, 100, 100],
      [-100, 100, 100],
      [100, -100, 100],
      [100, 100, -100]
    ];
    LIGHT_LIST.forEach(([x, y, z]) => {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
      directionalLight.position.set(x, y, z);
      this.scene?.add(directionalLight);
    });

    // 辅助器
    // const axesHelper = new THREE.AxesHelper(150);
    // this.scene?.add(axesHelper);
  }

  /** 加载3D地图 */
  async loadThreeMap() {
    HLJZone.features.forEach((elem, index) => {
      // 定一个省份3D对象
      const province = new THREE.Group() as THREE.Group<THREE.Object3DEventMap> & {
        properties: typeof elem.properties;
      };
      // 每个的 坐标 数组
      const coordinates = elem.geometry.coordinates;
      // 循环坐标数组
      coordinates.forEach(multiPolygon => {
        multiPolygon.forEach(polygon => {
          const shape = new THREE.Shape();
          const pointArr = [];

          for (let i = 0; i < polygon.length; i += 1) {
            const [x, y] = this.projection(polygon[i] as [number, number]) || [0, 0];

            if (i === 0) {
              shape.moveTo(x, -y);
            }
            shape.lineTo(x, -y);
            pointArr.push(x, -y, 4.01);
          }

          const extrudeSettings = {
            depth: 4,
            bevelEnabled: true,
            bevelSegments: 0,
            bevelThickness: 0.2
          };

          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

          const material = new THREE.MeshStandardMaterial({
            metalness: 1,
            roughness: 0.5,
            color: this.colorArr[0]
          });

          const material1 = new THREE.MeshStandardMaterial({
            metalness: 1,
            roughness: 1,
            color: this.colorArr[0]
          });

          const mesh = new THREE.Mesh(geometry, [material, material1]);
          mesh.name = `block${index}`;

          // mesh.castShadow = true;
          // mesh.receiveShadow = true;
          province.add(mesh);

          // 添加边界线
          const lineGeometry = new THREE.BufferGeometry();
          const lineMaterial = new THREE.LineBasicMaterial({ color: 'white' });
          const vertices = new Float32Array(pointArr);
          lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          const line = new THREE.LineLoop(lineGeometry, lineMaterial);
          province.add(line);

          // 添加地区标注 (json数据不准)
          // const properties = elem.properties;
          // const [x, y] = projection(properties.centroid || properties.center);
          // mesh.add(tag(properties.name, x, y, 5));
        });
      });

      // 将geo的属性放到省份模型中
      province.properties = elem.properties;

      this.threeMap.add(province);
    });
  }

  /** 加载点位标签 */
  async loadPointLabels() {
    const img = mapTitleBg;
    const labelContent = defineComponent(
      props => {
        const { mc, area } = props.item;
        return () => {
          return (
            <div
              class="asdfasd text-16px text-#fff leading-4vh px-10px text-center rounded-0.463vh bg-[rgba(25,25,25,0.5)] h-4vh pointer-events-none"
              style={{ background: `url(${img}) no-repeat`, backgroundSize: '100% 100%' }}
            >
              <span>{mc}: </span>
              <span class="text-20px" style={`color: ${this.colorArr[4]}`}>
                {area}{' '}
              </span>
              <span>万亩</span>
            </div>
          );
        };
      },
      {
        name: 'LabelContent',
        props: {
          item: {
            type: Object,
            default: () => ({})
          }
        }
      }
    );
    const labels: HTMLElement[] = [];
    const positions: THREE.Vector3[] = [];
    this.mapData.forEach((item: any) => {
      // 创建css2d Label
      const el = instantiatedComponent(labelContent, { item }).el as HTMLElement;
      const label = new CSS2DObject(el);
      // 设置mesh位置
      label.position.set(0, 0, 5.5);
      this.scene?.add(label);

      labels.push(el);
      positions.push(label.position);
    });
    // 添加标签入场动画
    gsap.from(labels, {
      opacity: 0,
      duration: 1,
      stagger: 0.05,
      ease: 'power1.inOut'
    });
    gsap.to(positions, {
      x: (index, _target, _targets) => {
        const { pointX, pointY } = this.mapData[index];
        const [x, _y] = this.projection([pointX, pointY]) || [0, 0];
        return x;
      },
      y: (index, _target, _targets) => {
        const { pointX, pointY } = this.mapData[index];
        const [_x, y] = this.projection([pointX, pointY]) || [0, 0];
        return -y;
      },
      duration: 1,
      stagger: 0.05,
      ease: 'power1.inOut'
    });
  }

  /** 加载地图特效 */
  async loadLightSweep() {
    const groundGeometry = new THREE.PlaneGeometry(120, 120);
    const groundMaterial = new LightSweepMaterial();
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.name = 'lightSweep';
    // ground.rotation.x = -Math.PI / 2;
    ground.position.z = 0;
    const ringWidth = 0.075;
    const T = Math.PI / 2;
    const clock = new THREE.Clock();
    this.renderMixins.set('loadLightSweep', () => {
      const elapsedTime = clock.getElapsedTime() / 3;
      const stage = (elapsedTime / T) % 2;

      if (stage < 1) ground.material.uniforms.innerRadius.value = 1.5 * Math.abs(Math.sin(elapsedTime));
      else ground.material.uniforms.innerRadius.value = 0;
      ground.material.uniforms.ringWidth.value = ringWidth;
    });
    // ground.castShadow = true;
    // ground.receiveShadow = true;

    this.scene?.add(ground);
  }

  /** 创建一个tag标签 */
  tag(name?: string) {
    // 创建div元素(作为标签)
    const tagContent = defineComponent(
      () => {
        return () => {
          return (
            <div class="text-16px text-#fff px-10px py-5px rounded-5px bg-[rgba(25,25,25,0.5)] block pointer-events-none absolute">
              {{ name }}
            </div>
          );
        };
      },
      {
        name: 'TagContent'
      }
    );
    const el = instantiatedComponent(tagContent).el as HTMLElement;
    // div元素包装为CSS2模型对象CSS2DObject
    const label = new CSS2DObject(el);
    this.scene?.add(label);
    return label; // 返回CSS2模型标签
  }

  /** 鼠标事件 */
  onMapHover() {
    let activeIntersect: THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>> | null = null;
    const mapLabel = this.tag();

    const onPointerMove = (event: PointerEvent) => {
      const intersects = this.intersect(event);
      // 获取被识别的对象
      const identifiedObject = intersects.find(item => {
        return item.object.name.startsWith('block');
      }) as THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>;
      if (identifiedObject && activeIntersect?.object.name === identifiedObject.object.name) {
        const vector3 = new THREE.Vector3(
          identifiedObject.point.x,
          identifiedObject.point.y + 2,
          identifiedObject.point.z + 1
        );
        mapLabel.position.copy(vector3);
        return;
      }
      if (activeIntersect) {
        // 将上一次选中的恢复颜色
        const { object } = activeIntersect as THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>;
        const { material } = object as THREE.Mesh<
          THREE.ExtrudeGeometry,
          THREE.MeshStandardMaterial[],
          THREE.Object3DEventMap
        >;
        material[0].color.set(this.colorArr[0]);
        // 添加地块动效
        gsap.to(object.parent!.position, {
          z: 0,
          duration: 0.3,
          ease: 'power1.inOut'
        });
        // material[1].color.set(_color);
        mapLabel.element.style.visibility = 'hidden';
      }
      // 没有选中,隐藏label

      activeIntersect = null; // 设置为空
      if (identifiedObject) {
        activeIntersect = identifiedObject;
        (
          identifiedObject.object as THREE.Mesh<
            THREE.ExtrudeGeometry,
            THREE.MeshStandardMaterial[],
            THREE.Object3DEventMap
          >
        ).material[0].color.set(this.HIGHT_COLOR);
        // 添加地块动效
        gsap.to(identifiedObject.object.parent!.position, {
          z: 1,
          duration: 0.3,
          ease: 'power1.inOut'
        });
        // identifiedObject.object.material[1].color.set(HIGHT_COLOR);

        // 显示label
        const properties = (
          identifiedObject.object.parent as THREE.Group<THREE.Object3DEventMap> & {
            properties: any;
          }
        ).properties;
        const vector3 = new THREE.Vector3(
          identifiedObject.point.x,
          identifiedObject.point.y + 2,
          identifiedObject.point.z + 1
        );
        mapLabel.position.copy(vector3);
        mapLabel.element.innerHTML = properties.name;
        mapLabel.element.style.visibility = 'visible';
      }
    };

    useEventListener(this.dom, 'pointermove', e => {
      onPointerMove(e);
    });
  }

  async render() {
    this.scene?.add(this.threeMap);
    this.camera?.position.set(0, -40, 70);
    this.camera?.lookAt(0, 0, 0);
    this.loadLights();
    // 当全部加载任务完成时完毕触发
    await this.loadTasks([this.loadThreeMap(), this.loadPointLabels(), this.loadLightSweep()]);
    super.render();
    this.onMapHover();
  }
}
