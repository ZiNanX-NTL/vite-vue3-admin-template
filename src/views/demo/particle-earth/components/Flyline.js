import gsap from 'gsap';
import {
  abs,
  attribute,
  cameraPosition,
  cross,
  float,
  fract,
  length,
  modelWorldMatrix,
  modelWorldMatrixInverse,
  normalize,
  positionLocal,
  smoothstep,
  uniform,
  uv,
  vec3,
  vec4
} from 'three/tsl';
import * as THREE from 'three/webgpu';

const CURVE_SEGMENTS = 64;

function lngLatToUnitVec3(lng, lat, radius = 1) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng);

  return new THREE.Vector3(
    Math.sin(phi) * Math.sin(theta) * radius,
    Math.cos(phi) * radius,
    Math.sin(phi) * Math.cos(theta) * radius
  );
}

function buildRibbonGeometry(start, end, arcHeight) {
  const positions = new Float32Array(CURVE_SEGMENTS * 2 * 3);
  const directions = new Float32Array(CURVE_SEGMENTS * 2 * 3);
  const uvs = new Float32Array(CURVE_SEGMENTS * 2 * 2);
  const indices = [];
  const from = start.clone().normalize();
  const to = end.clone().normalize();
  const dot = THREE.MathUtils.clamp(from.dot(to), -1, 1);
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega) || 1;
  const curvePoints = [];

  for (let index = 0; index < CURVE_SEGMENTS; index++) {
    const t = index / (CURVE_SEGMENTS - 1);
    const weightA = Math.sin((1 - t) * omega) / sinOmega;
    const weightB = Math.sin(t * omega) / sinOmega;
    const point = new THREE.Vector3()
      .addScaledVector(from, weightA)
      .addScaledVector(to, weightB)
      .multiplyScalar((1 + arcHeight * Math.sin(Math.PI * t)) * start.length());

    curvePoints.push(point);
  }

  const direction = new THREE.Vector3();
  for (let index = 0; index < CURVE_SEGMENTS; index++) {
    if (index < CURVE_SEGMENTS - 1) {
      direction.subVectors(curvePoints[index + 1], curvePoints[index]);
    } else {
      direction.subVectors(curvePoints[index], curvePoints[index - 1]);
    }

    const point = curvePoints[index];
    const baseIndex = index * 2;
    positions.set([point.x, point.y, point.z], baseIndex * 3);
    positions.set([point.x, point.y, point.z], (baseIndex + 1) * 3);
    directions.set([direction.x, direction.y, direction.z], baseIndex * 3);
    directions.set([direction.x, direction.y, direction.z], (baseIndex + 1) * 3);
    uvs.set([index / (CURVE_SEGMENTS - 1), 1], baseIndex * 2);
    uvs.set([index / (CURVE_SEGMENTS - 1), -1], (baseIndex + 1) * 2);

    if (index < CURVE_SEGMENTS - 1) {
      const a = baseIndex;
      const b = baseIndex + 1;
      const c = baseIndex + 2;
      const d = baseIndex + 3;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('direction', new THREE.BufferAttribute(directions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

class FlyLine {
  constructor({ parent, shared, start, end, color }) {
    this.parent = parent;
    this.shared = shared;
    this.arrived = false;
    this.tweens = [];
    this.uniforms = {
      progress: uniform(0),
      flowTime: uniform(0),
      postFade: uniform(1),
      color: uniform(new THREE.Color(color ?? shared.params.color))
    };

    this.geometry = buildRibbonGeometry(start, end, shared.params.arcHeight);
    this.material = this.createMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    parent.add(this.mesh);
  }

  createMaterial() {
    const material = new THREE.MeshBasicNodeMaterial();
    material.transparent = true;
    material.depthWrite = false;
    material.side = THREE.DoubleSide;

    const directionAttr = attribute('direction', 'vec3');
    const lineDirection = directionAttr.transformDirection(modelWorldMatrix).normalize();
    const positionWorld = modelWorldMatrix.mul(vec4(positionLocal, 1)).xyz;
    const toCamera = cameraPosition.sub(positionWorld).normalize();
    const raw = cross(lineDirection, toCamera);
    const fallbackA = cross(lineDirection, vec3(0, 1, 0));
    const fallbackB = cross(lineDirection, vec3(1, 0, 0));
    const alternate = length(fallbackA).greaterThan(float(1e-4)).select(normalize(fallbackA), normalize(fallbackB));
    const tangent = length(raw).greaterThan(float(1e-4)).select(normalize(raw), alternate);
    const offsetWorld = tangent.mul(uv().y).mul(this.shared.uniforms.lineWidth);
    material.positionNode = modelWorldMatrixInverse.mul(vec4(positionWorld.add(offsetWorld), 1)).xyz;

    const u = uv().x;
    const vAbs = abs(uv().y);
    const lateralMask = float(1).sub(smoothstep(float(0.55), float(0.95), vAbs));
    const coreMask = float(1).sub(smoothstep(float(0), float(0.55), vAbs));
    const coreGlow = coreMask.pow(3).mul(this.shared.uniforms.coreBoost);
    const grown = float(1).sub(
      smoothstep(
        this.uniforms.progress.sub(this.shared.uniforms.headSoftness),
        this.uniforms.progress,
        u
      )
    );
    const flowHead = fract(this.uniforms.flowTime.mul(this.shared.uniforms.flowSpeed));
    const flowMask = smoothstep(this.shared.uniforms.flowLength, float(0), fract(flowHead.sub(u)));
    const flowOn = smoothstep(float(0.98), float(1), this.uniforms.progress);
    const alpha = grown.mul(this.uniforms.postFade).add(flowOn.mul(flowMask)).mul(lateralMask);
    const tint = this.uniforms.color.add(vec3(1, 1, 1).sub(this.uniforms.color).mul(coreGlow));

    material.colorNode = tint.mul(alpha).mul(this.shared.uniforms.intensity);
    material.opacityNode = alpha;

    return material;
  }

  play({ onArrive } = {}) {
    this.tweens.forEach(tween => tween.kill());
    this.tweens.length = 0;
    this.uniforms.progress.value = 0;
    this.uniforms.postFade.value = 1;
    this.arrived = false;

    const growTween = gsap.to(this.uniforms.progress, {
      value: 1,
      duration: this.shared.params.growth,
      ease: this.shared.params.growthEase,
      onComplete: () => {
        this.arrived = true;
        const fadeTween = gsap.to(this.uniforms.postFade, {
          value: this.shared.params.postArriveFade,
          duration: this.shared.params.postArriveFadeDuration,
          ease: 'power1.out'
        });
        this.tweens.push(fadeTween);
        onArrive?.();
      }
    });

    this.tweens.push(growTween);
  }

  update(delta) {
    if (this.arrived) {
      this.uniforms.flowTime.value += delta;
    }
  }

  dispose() {
    this.tweens.forEach(tween => tween.kill());
    this.parent.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}

export function createFlyline({
  radius = 1,
  params = {},
  hub = { lng: 116.4, lat: 39.9 },
  targets = [
    { lng: -74, lat: 40.7 },
    { lng: -0.1, lat: 51.5 },
    { lng: 139.7, lat: 35.7 },
    { lng: -122.4, lat: 37.8 },
    { lng: 151.2, lat: -33.9 },
    { lng: 2.35, lat: 48.86 },
    { lng: 13.4, lat: 52.52 },
    { lng: 55.27, lat: 25.2 },
    { lng: 28, lat: -26.2 },
    { lng: 103.8, lat: 1.35 },
    { lng: -46.6, lat: -23.5 },
    { lng: -99.1, lat: 19.4 },
    { lng: 72.8, lat: 19.08 }
  ]
} = {}) {
  const root = new THREE.Group();
  const lines = [];
  const delayedCalls = [];
  const hubVector = lngLatToUnitVec3(hub.lng, hub.lat, radius);
  const shared = {
    params: {
      color: params.flylineColor ?? '#4e87df',
      arcHeight: 0.18,
      growth: 0.2,
      growthEase: 'power2.out',
      postArriveFade: 0.3,
      postArriveFadeDuration: 0.4
    },
    uniforms: {
      headSoftness: uniform(0.05),
      flowSpeed: uniform(params.flylineFlowSpeed ?? 2.0),
      flowLength: uniform(0.15),
      intensity: uniform(params.flylineIntensity ?? 0.9),
      lineWidth: uniform(params.flylineWidth ?? 0.005),
      coreBoost: uniform(1.35)
    }
  };

  targets.forEach((target, index) => {
    const targetVector = lngLatToUnitVec3(target.lng, target.lat, radius);
    const line = new FlyLine({
      parent: root,
      shared,
      start: hubVector,
      end: targetVector,
      color: target.color ?? params.flylineColor
    });
    lines.push(line);

    delayedCalls.push(gsap.delayedCall(index * 0.25, () => {
      line.play();
    }));
  });

  return {
    object: root,
    update(delta) {
      lines.forEach(line => line.update(delta));
    },
    updateParams(nextParams = {}) {
      shared.uniforms.lineWidth.value = nextParams.flylineWidth ?? 0.005;
      shared.uniforms.intensity.value = nextParams.flylineIntensity ?? 0.9;
      shared.uniforms.flowSpeed.value = nextParams.flylineFlowSpeed ?? 2.0;
      lines.forEach(line => {
        line.uniforms.color.value.set(nextParams.flylineColor ?? '#4e87df');
      });
    },
    dispose() {
      delayedCalls.forEach(call => call.kill());
      lines.forEach(line => line.dispose());
      lines.length = 0;
    }
  };
}
