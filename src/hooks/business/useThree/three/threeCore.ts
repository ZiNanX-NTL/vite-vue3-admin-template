import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/** treejs核心类 */
export class ThreeCore {
  dom: HTMLElement | null;

  scene: THREE.Scene;

  camera: THREE.PerspectiveCamera;

  CSSRenderer: CSS2DRenderer;

  renderer: THREE.WebGLRenderer;

  control: OrbitControls;

  constructor(dom: HTMLElement | null) {
    this.dom = dom;
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
