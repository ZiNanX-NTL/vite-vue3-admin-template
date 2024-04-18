import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { GeoProjection } from 'd3';
import { geoMercator } from 'd3';
import { gsap } from 'gsap';
import { useThemeStore } from '@/store';
import { instantiatedComponent, getColorPalettes } from '@/utils';
import HLJZone from '@/assets/json/HLJZone.json';
import mapTitleBg from '@/assets/images/map_title_bg.png';
import { useRender } from '../../common';
import { useThree } from './useThree';
import { LightSweepMaterial } from './shaders/lightSweep';

export function useThreeMap(mapData: any) {
  const { domRef, loading, ThreeBase } = useThree();
  const theme = useThemeStore();

  /** ThreeMap类 */
  class ThreeMap extends ThreeBase {
    threeMap: THREE.Group;

    projection: GeoProjection;

    colorArr: string[];

    HIGHT_COLOR: string;

    constructor() {
      super();
      this.threeMap = new THREE.Group();
      // 墨卡托投影转换
      this.projection = geoMercator().center([127.84, 47.44]).scale(250).translate([0, 0]);
      this.colorArr = getColorPalettes(theme.themeColor).reverse();
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
      HLJZone.features.forEach((elem, _index) => {
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
                class="asdfasd pointer-events-none h-4vh rounded-0.463vh bg-[rgba(25,25,25,0.5)] px-10px text-center text-16px text-#fff leading-4vh"
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
      mapData.forEach((item: any) => {
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
          const { pointX, pointY } = mapData[index];
          const [x, _y] = this.projection([pointX, pointY]) || [0, 0];
          return x;
        },
        y: (index, _target, _targets) => {
          const { pointX, pointY } = mapData[index];
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

    async render() {
      this.scene?.add(this.threeMap);
      this.camera?.position.set(0, -40, 70);
      this.camera?.lookAt(0, 0, 0);
      this.loadLights();
      // 当全部加载任务完成时完毕触发
      await ThreeMap.loadTasks([this.loadThreeMap(), this.loadPointLabels(), this.loadLightSweep()]);
      super.render();
    }
  }

  const { instance, isRendered } = useRender(domRef, {
    render: () => {
      const ins = new ThreeMap();
      ins.render();
      return ins;
    }
  });
  /**
   * update
   *
   * @param callback callback function
   */
  async function update(callback: (instance: ThreeMap | null) => void = () => {}) {
    if (!isRendered()) return;

    callback(instance.value);
  }

  return {
    domRef,
    loading,
    ThreeMap,
    instance,
    update
  };
}
