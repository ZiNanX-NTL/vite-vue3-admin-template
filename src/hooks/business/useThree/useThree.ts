import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { useEventListener } from '@vueuse/core';
import { isFunction } from '@/utils';
import { useLoading } from '../../common';

export function useThree() {
  const domRef = ref<HTMLElement | null>(null);

  const { loading, startLoading, endLoading } = useLoading(true);

  /** treejs核心类 */
  class ThreeCore {
    dom: HTMLElement | null;

    scene: THREE.Scene;

    camera: THREE.PerspectiveCamera;

    CSSRenderer: CSS2DRenderer;

    renderer: THREE.WebGLRenderer;

    control: OrbitControls;

    constructor() {
      this.dom = domRef.value;
      this.scene = ThreeCore.initScene();
      this.camera = this.initCamera();
      this.CSSRenderer = this.initCSSRender();
      this.renderer = this.initRender();
      this.control = this.initControl();
    }

    static initScene() {
      const scene = new THREE.Scene();
      return scene;
    }

    initCamera() {
      const fov = 45;
      const near = 0.1;
      const far = 5000;
      const aspect = this.dom!.offsetWidth / this.dom!.offsetHeight;
      const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      camera.position.set(0, 0, 0);
      return camera;
    }

    updateCamera() {
      const aspect = this.dom!.offsetWidth / this.dom!.offsetHeight;
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
    }

    initCSSRender() {
      const CSSRenderer = new CSS2DRenderer();
      CSSRenderer.setSize(this.dom!.offsetWidth, this.dom!.offsetHeight);
      CSSRenderer.domElement.style.position = 'absolute';
      CSSRenderer.domElement.style.top = '0px';
      this.dom!.appendChild(CSSRenderer.domElement);
      return CSSRenderer;
    }

    updateCSSRender() {
      this.CSSRenderer.setSize(this.dom!.offsetWidth, this.dom!.offsetHeight);
    }

    initRender() {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      // renderer.setClearColor('#000')
      renderer.shadowMap.enabled = true;
      renderer.setSize(this.dom!.offsetWidth, this.dom!.offsetHeight);
      renderer.localClippingEnabled = true;
      this.dom!.appendChild(renderer.domElement);
      return renderer;
    }

    updateRender() {
      this.renderer.setSize(this.dom!.offsetWidth, this.dom!.offsetHeight);
    }

    initControl() {
      const control = new OrbitControls(this.camera, this.dom!);
      control.target = new THREE.Vector3(0, 0, 0);
      control.update();
      return control;
    }
  }
  /** 封装基本类 */
  class ThreeBase extends ThreeCore {
    clock: THREE.Clock;

    composers: Map<string, any>;

    renderMixins: Map<string, any>;

    mixers: THREE.AnimationMixer[] = [];

    raycaster: THREE.Raycaster;

    mouse: THREE.Vector2;

    constructor() {
      super();
      this.clock = new THREE.Clock();
      this.composers = new Map();
      this.renderMixins = new Map();
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
    }

    render() {
      useEventListener(window, 'resize', this.update);

      this.exeRender();
    }

    exeRender() {
      this.renderer.render(this.scene, this.camera);
      this.CSSRenderer.render(this.scene, this.camera);

      const delta = new THREE.Clock().getDelta();
      const mixerUpdateDelta = this.clock.getDelta();
      this.mixers.forEach(mixer => mixer.update(mixerUpdateDelta));
      this.composers.forEach(composer => composer.render(delta));
      this.renderMixins.forEach(mixin => isFunction(mixin) && mixin());

      requestAnimationFrame(() => this.exeRender());
    }

    update() {
      this.updateCamera();
      this.updateRender();
      this.updateCSSRender();
    }

    /** 加载任务静态方法 */
    static async loadTasks(tasks: Promise<any>[]) {
      startLoading();
      await Promise.all(tasks);
      endLoading();
    }

    /** 加载GLTF静态方法 */
    static loadGLTF(url: string) {
      const loader = new GLTFLoader();
      const onCompleted = (object: GLTF, resolve: (value: GLTF | PromiseLike<GLTF>) => void) => resolve(object);
      return new Promise<GLTF>(resolve => {
        loader.load(url, object => onCompleted(object, resolve));
      });
    }

    /** 加载贴图静态方法 */
    static loadTexture(url: string) {
      const loader = new THREE.TextureLoader();
      const onCompleted = (
        cubeTexture: THREE.Texture,
        resolve: (value: THREE.Texture | PromiseLike<THREE.Texture>) => void
      ) => resolve(cubeTexture);
      return new Promise<THREE.Texture>(resolve => {
        loader.load(url, cubeTexture => onCompleted(cubeTexture, resolve));
      });
    }

    /** 加载动画方法 */
    loadAnimate(
      mesh: THREE.Object3D<THREE.Object3DEventMap> | THREE.AnimationObjectGroup,
      animations: THREE.AnimationClip[],
      animationName: string
    ) {
      const mixer = new THREE.AnimationMixer(mesh);
      const clip = THREE.AnimationClip.findByName(animations, animationName);
      if (!clip) return undefined;
      const action = mixer.clipAction(clip);
      action.play();
      this.mixers.push(mixer);
      return undefined;
    }

    /** 鼠标拾取方法 */
    intersect(event: MouseEvent) {
      // 父级并非满屏，所以需要减去父级的left 和 top
      this.mouse.x = (event.offsetX / this.dom!.offsetWidth) * 2 - 1;
      this.mouse.y = -(event.offsetY / this.dom!.offsetHeight) * 2 + 1;
      this.raycaster?.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster?.intersectObjects(this.scene?.children, true);
      return intersects;
    }
  }

  return {
    domRef,
    loading,
    startLoading,
    endLoading,
    ThreeCore,
    ThreeBase
  };
}
