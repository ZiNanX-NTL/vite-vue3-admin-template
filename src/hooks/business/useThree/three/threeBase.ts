import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { useEventListener } from '@vueuse/core';
import { isFunction } from '@/utils';
import { ThreeCore } from './threeCore';

export interface ThreeBaseOptions {
	taskLoadStart?: () => void;
	taskLoadEnd?: () => void;
}

/** 封装基本类 */
export class ThreeBase extends ThreeCore {
	clock: THREE.Clock;

	composers: Map<string, any>;

	renderMixins: Map<string, any>;

	mixers: THREE.AnimationMixer[] = [];

	raycaster: THREE.Raycaster;

	mouse: THREE.Vector2;

	options: ThreeBaseOptions;

	constructor(
		dom: HTMLElement | null,
		options: ThreeBaseOptions = {
			taskLoadStart: () => {},
			taskLoadEnd: () => {}
		}
	) {
		super(dom);
		this.clock = new THREE.Clock();
		this.composers = new Map();
		this.renderMixins = new Map();
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.options = options;
	}

	render() {
		useEventListener(window, 'resize', () => {
			this.update();
		});

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
	async loadTasks(tasks: Promise<any>[]) {
		this.options.taskLoadStart?.();
		await Promise.all(tasks);
		this.options.taskLoadEnd?.();
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
