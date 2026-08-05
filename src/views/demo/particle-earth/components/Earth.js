import {
  abs,
  clamp,
  cos,
  dot,
  float,
  floor,
  Fn,
  fract,
  instanceIndex,
  length,
  max,
  mix,
  mx_noise_float,
  normalView,
  positionGeometry,
  positionLocal,
  positionViewDirection,
  pow,
  saturate,
  sin,
  smoothstep,
  step,
  time,
  uniform,
  uv,
  vec2,
  vec3,
  vec4
} from 'three/tsl';
import * as THREE from 'three/webgpu';

const ASSET_ROOT = '../heroSection/particleEarth';
const HEX_S = vec2(1.0, 1.7320508);
const HEX_S4 = vec4(1.0, 1.7320508, 1.0, 1.7320508);
const HEX_HALF = vec2(0.5, 0.8660254);

const hexEdge = Fn(([p, width]) => {
  const q = vec4(p.x, p.y, p.x.sub(0.5), p.y.sub(1.0));
  const hC = floor(q.div(HEX_S4)).add(0.5);
  const h = vec4(p.sub(hC.xy.mul(HEX_S)), p.sub(hC.zw.add(0.5).mul(HEX_S)));
  const useA = step(dot(h.xy, h.xy), dot(h.zw, h.zw));
  const cell = abs(mix(h.zw, h.xy, useA));
  const d = max(dot(cell, HEX_HALF), cell.x);
  return smoothstep(float(0.5).sub(width), float(0.5), d);
});

const hexCellId = Fn(([p]) => {
  const q = vec4(p.x, p.y, p.x.sub(0.5), p.y.sub(1.0));
  const hC = floor(q.div(HEX_S4)).add(0.5);
  const h = vec4(p.sub(hC.xy.mul(HEX_S)), p.sub(hC.zw.add(0.5).mul(HEX_S)));
  const useA = step(dot(h.xy, h.xy), dot(h.zw, h.zw));
  return mix(hC.zw.add(0.5), hC.xy, useA);
});

function loadMask(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0);

      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      resolve({ data, width: canvas.width, height: canvas.height });
    };
    image.onerror = reject;
    image.src = url;
  });
}

function sampleDarkPixel(mask, u, v, threshold) {
  const x = Math.min(mask.width - 1, Math.max(0, Math.floor(u * mask.width)));
  const y = Math.min(mask.height - 1, Math.max(0, Math.floor(v * mask.height)));
  const index = (y * mask.width + x) * 4;
  const luminance = (
    mask.data[index]
    + mask.data[index + 1]
    + mask.data[index + 2]
  ) / (3 * 255);

  return luminance < threshold;
}

function getSphereUv(x, y, z) {
  const lon = Math.atan2(x, z);
  const lat = Math.asin(y);
  return [
    lon / (2 * Math.PI) + 0.5,
    0.5 - lat / Math.PI
  ];
}

function createMaskPositions({
  mask,
  sampleCount,
  threshold,
  radius
}) {
  const goldenRatio = (Math.sqrt(5) + 1) / 2;
  const positions = [];

  for (let index = 0; index < sampleCount; index++) {
    const progress = index / sampleCount;
    const theta = (2 * Math.PI * index) / goldenRatio;
    const phi = Math.acos(1 - 2 * progress);

    const sx = Math.sin(phi) * Math.cos(theta);
    const sy = Math.sin(phi) * Math.sin(theta);
    const sz = Math.cos(phi);
    const x = sy;
    const y = sz;
    const z = sx;
    const [u, v] = getSphereUv(x, y, z);

    if (sampleDarkPixel(mask, u, v, threshold)) {
      positions.push([x * radius, y * radius, z * radius]);
    }
  }

  return positions;
}

function applyInstanceMatrices(mesh, positions) {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3(1, 1, 1);
  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const zAxis = new THREE.Vector3(0, 0, 1);

  positions.forEach(([x, y, z], index) => {
    position.set(x, y, z);
    normal.copy(position).normalize();
    quaternion.setFromUnitVectors(zAxis, normal);
    matrix.compose(position, quaternion, scale);
    mesh.setMatrixAt(index, matrix);
  });

  mesh.instanceMatrix.needsUpdate = true;
}

function createDotMaterial({
  color,
  dotFalloff,
  dotCoreBoost,
  sizeVariation,
  brightnessVariation,
  twinkleIntensity,
  twinkleSpeed,
  twinkleSharpness,
  edgeFadeStart = 0.13,
  edgeFadeEnd = 0.305
}) {
  const colorUniform = uniform(new THREE.Color(color));
  const dotScaleUniform = uniform(1);
  const dotFalloffUniform = uniform(dotFalloff);
  const dotCoreBoostUniform = uniform(dotCoreBoost);
  const sizeVariationUniform = uniform(sizeVariation);
  const brightnessVariationUniform = uniform(brightnessVariation);
  const twinkleIntensityUniform = uniform(twinkleIntensity);
  const twinkleSpeedUniform = uniform(twinkleSpeed);
  const twinkleSharpnessUniform = uniform(twinkleSharpness);
  const edgeFadeStartUniform = uniform(edgeFadeStart);
  const edgeFadeEndUniform = uniform(edgeFadeEnd);

  const idx = instanceIndex.toFloat();
  const hashSize = fract(sin(idx.mul(12.9898)).mul(43758.5453));
  const hashBright = fract(sin(idx.mul(78.233)).mul(43758.5453));
  const hashTwinkle = fract(sin(idx.mul(19.1919)).mul(43758.5453));

  const sizeFactor = float(1).add(hashSize.sub(0.5).mul(2).mul(sizeVariationUniform));
  const brightFactor = float(1).add(hashBright.sub(0.5).mul(2).mul(brightnessVariationUniform));
  const centeredUv = uv().sub(vec2(0.5));
  const d = saturate(length(centeredUv).mul(2));
  const radial = pow(float(1).sub(d), dotFalloffUniform);
  const core = pow(float(1).sub(d), dotFalloffUniform.mul(3));
  const softDisk = saturate(radial.add(core.mul(dotCoreBoostUniform)));
  const facing = saturate(normalView.dot(positionViewDirection));
  const edgeMask = smoothstep(edgeFadeStartUniform, edgeFadeEndUniform, facing);
  const disk = softDisk.mul(edgeMask);
  const twinklePhase = hashTwinkle.mul(float(Math.PI * 2));
  const twinkleWave = sin(time.mul(twinkleSpeedUniform).add(twinklePhase)).mul(0.5).add(0.5);
  const twinkleSparkle = pow(saturate(twinkleWave), twinkleSharpnessUniform);
  const twinkleMul = float(1).add(twinkleSparkle.mul(twinkleIntensityUniform));
  const base = colorUniform.mul(disk).mul(brightFactor).mul(twinkleMul);

  const material = new THREE.MeshLambertNodeMaterial();
  material.side = THREE.DoubleSide;
  material.transparent = true;
  material.depthWrite = false;
  material.positionNode = positionGeometry.mul(sizeFactor).mul(dotScaleUniform);
  material.colorNode = base;
  material.opacityNode = disk;
  material.emissiveNode = base;

  material.userData.tslUniforms = {
    color: colorUniform,
    dotScale: dotScaleUniform,
    twinkleIntensity: twinkleIntensityUniform
  };

  return material;
}

async function createPointLayer({
  maskUrl,
  sampleCount,
  threshold,
  radius,
  dotSize,
  materialOptions
}) {
  const mask = await loadMask(maskUrl);
  const positions = createMaskPositions({ mask, sampleCount, threshold, radius });
  const geometry = new THREE.PlaneGeometry(dotSize, dotSize);
  const material = createDotMaterial(materialOptions);
  const mesh = new THREE.InstancedMesh(geometry, material, positions.length);

  mesh.frustumCulled = false;
  applyInstanceMatrices(mesh, positions);

  return { mesh, geometry, material };
}

function createInnerSphere(radius) {
  const geometry = new THREE.SphereGeometry(radius, 48, 32);
  const material = new THREE.MeshPhysicalNodeMaterial();
  material.colorNode = uniform(new THREE.Color('#0f1a32'));
  material.roughnessNode = float(0.42);
  material.metalnessNode = float(0.0);
  material.clearcoatNode = float(0.45);
  material.clearcoatRoughnessNode = float(0.35);

  return new THREE.Mesh(geometry, material);
}

function getShieldParams(params = {}) {
  return {
    shieldColor: params.shieldColor ?? '#689ee5',
    shieldNoiseColor: params.shieldNoiseColor ?? '#14a7ff',
    shieldRadius: params.shieldRadius ?? 1,
    shieldLife: params.shieldLife ?? 1,
    shieldOpacity: params.shieldOpacity ?? 0.93,
    shieldFresnelPower: params.shieldFresnelPower ?? 1,
    shieldFresnelStrength: params.shieldFresnelStrength ?? 0.35,
    shieldHexScale: params.shieldHexScale ?? 12,
    shieldEdgeWidth: params.shieldEdgeWidth ?? 0.06,
    shieldHexOpacity: params.shieldHexOpacity ?? 0.14,
    shieldFlashSpeed: params.shieldFlashSpeed ?? 2.9,
    shieldFlashIntensity: params.shieldFlashIntensity ?? 0.11,
    shieldFlowScale: params.shieldFlowScale ?? 4,
    shieldFlowSpeed: params.shieldFlowSpeed ?? 1.5,
    shieldFlowIntensity: params.shieldFlowIntensity ?? 4,
    shieldReveal: params.shieldReveal ?? 0,
    shieldNoiseScale: params.shieldNoiseScale ?? 1.65,
    shieldNoiseEdgeWidth: params.shieldNoiseEdgeWidth ?? 0.02,
    shieldNoiseEdgeIntensity: params.shieldNoiseEdgeIntensity ?? 9.8,
    shieldNoiseEdgeSmoothness: params.shieldNoiseEdgeSmoothness ?? 0.5,
    shieldFadeStart: params.shieldFadeStart ?? 0.17
  };
}

function syncShieldParams(shield, params = {}) {
  const shieldParams = getShieldParams(params);
  const uniforms = shield.material.userData.tslUniforms;

  uniforms.color.value.set(shieldParams.shieldColor);
  uniforms.noiseEdgeColor.value.set(shieldParams.shieldNoiseColor);
  uniforms.life.value = shieldParams.shieldLife;
  uniforms.opacity.value = shieldParams.shieldOpacity;
  uniforms.fresnelPower.value = shieldParams.shieldFresnelPower;
  uniforms.fresnelStrength.value = shieldParams.shieldFresnelStrength;
  uniforms.hexScale.value = shieldParams.shieldHexScale;
  uniforms.edgeWidth.value = shieldParams.shieldEdgeWidth;
  uniforms.hexOpacity.value = shieldParams.shieldHexOpacity;
  uniforms.flashSpeed.value = shieldParams.shieldFlashSpeed;
  uniforms.flashIntensity.value = shieldParams.shieldFlashIntensity;
  uniforms.flowScale.value = shieldParams.shieldFlowScale;
  uniforms.flowSpeed.value = shieldParams.shieldFlowSpeed;
  uniforms.flowIntensity.value = shieldParams.shieldFlowIntensity;
  uniforms.reveal.value = shieldParams.shieldReveal;
  uniforms.noiseScale.value = shieldParams.shieldNoiseScale;
  uniforms.noiseEdgeWidth.value = shieldParams.shieldNoiseEdgeWidth;
  uniforms.noiseEdgeIntensity.value = shieldParams.shieldNoiseEdgeIntensity;
  uniforms.noiseEdgeSmoothness.value = shieldParams.shieldNoiseEdgeSmoothness;
  uniforms.fadeStart.value = shieldParams.shieldFadeStart;

  shield.scale.setScalar((shield.userData.baseRadius ?? 1) * shieldParams.shieldRadius);
}

function createShield(radius, params) {
  const shieldParams = getShieldParams(params);
  const uniforms = {
    time: uniform(0),
    color: uniform(new THREE.Color(shieldParams.shieldColor)),
    noiseEdgeColor: uniform(new THREE.Color(shieldParams.shieldNoiseColor)),
    life: uniform(shieldParams.shieldLife),
    opacity: uniform(shieldParams.shieldOpacity),
    fresnelPower: uniform(shieldParams.shieldFresnelPower),
    fresnelStrength: uniform(shieldParams.shieldFresnelStrength),
    hexScale: uniform(shieldParams.shieldHexScale),
    edgeWidth: uniform(shieldParams.shieldEdgeWidth),
    hexOpacity: uniform(shieldParams.shieldHexOpacity),
    flashSpeed: uniform(shieldParams.shieldFlashSpeed),
    flashIntensity: uniform(shieldParams.shieldFlashIntensity),
    flowScale: uniform(shieldParams.shieldFlowScale),
    flowSpeed: uniform(shieldParams.shieldFlowSpeed),
    flowIntensity: uniform(shieldParams.shieldFlowIntensity),
    reveal: uniform(shieldParams.shieldReveal),
    noiseScale: uniform(shieldParams.shieldNoiseScale),
    noiseEdgeWidth: uniform(shieldParams.shieldNoiseEdgeWidth),
    noiseEdgeIntensity: uniform(shieldParams.shieldNoiseEdgeIntensity),
    noiseEdgeSmoothness: uniform(shieldParams.shieldNoiseEdgeSmoothness),
    fadeStart: uniform(shieldParams.shieldFadeStart)
  };

  const material = new THREE.MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide
  });

  const noise = mx_noise_float(positionLocal.mul(uniforms.noiseScale)).mul(0.5).add(0.5);
  const revealMask = smoothstep(uniforms.reveal.sub(uniforms.noiseEdgeWidth), uniforms.reveal, noise);
  const innerFade = mix(float(0.98), float(0.15), uniforms.noiseEdgeSmoothness);
  const edgeLow = smoothstep(
    uniforms.reveal.sub(uniforms.noiseEdgeWidth),
    uniforms.reveal.sub(uniforms.noiseEdgeWidth.mul(innerFade)),
    noise
  );
  const edgeHigh = smoothstep(
    uniforms.reveal.sub(uniforms.noiseEdgeWidth.mul(0.15)),
    uniforms.reveal,
    noise
  );
  const revealEdge = edgeLow.mul(edgeHigh.oneMinus());

  const ndv = saturate(normalView.dot(positionViewDirection));
  const fresnelStrengthOsc = uniforms.fresnelStrength.add(float(0.25).mul(cos(uniforms.time.mul(2.0))));
  const fresnel = pow(float(1).sub(ndv), uniforms.fresnelPower).mul(fresnelStrengthOsc);

  const flowTime = uniforms.time.mul(uniforms.flowSpeed);
  const fn1 = mx_noise_float(
    positionLocal.mul(uniforms.flowScale).add(vec3(flowTime, flowTime.mul(0.6), flowTime.mul(0.4)))
  );
  const fn2 = mx_noise_float(
    positionLocal.mul(uniforms.flowScale.mul(2.1))
      .add(vec3(flowTime.mul(-0.5), flowTime.mul(0.9), flowTime.mul(0.3)))
  );
  const flowNoise = fn1.mul(0.6).add(fn2.mul(0.4)).mul(0.5).add(0.5);

  const absPosition = abs(positionLocal);
  const dominance = max(absPosition.x, max(absPosition.y, absPosition.z));
  const hexFade = smoothstep(float(0.65), float(0.85), dominance);
  const isX = step(max(absPosition.y, absPosition.z), absPosition.x);
  const isY = step(absPosition.z, absPosition.y).mul(isX.oneMinus());
  const faceUv = positionLocal.yz.mul(isX)
    .add(positionLocal.xz.mul(isY))
    .add(positionLocal.xy.mul(isX.add(isY).oneMinus()));
  const scaledUv = faceUv.mul(uniforms.hexScale);
  const hex = hexEdge(scaledUv, uniforms.edgeWidth).mul(hexFade);
  const cellId = hexCellId(scaledUv);

  const random = fract(sin(dot(cellId, vec2(127.1, 311.7))).mul(43758.5453));
  const phase = random.mul(6.2831);
  const speed = random.mul(1.5).add(0.5);
  const flashWave = sin(uniforms.time.mul(uniforms.flashSpeed).mul(speed).add(phase)).mul(0.5).add(0.5);
  const flash = smoothstep(float(0.6), float(1.0), flashWave)
    .mul(uniforms.flashIntensity)
    .mul(hexFade);

  const lifeColor = mix(vec3(1.0, 0.08, 0.04), uniforms.color, uniforms.life);
  const intensity = hex.mul(uniforms.hexOpacity)
    .mul(fresnel.mul(0.7).add(0.3))
    .add(fresnel.mul(0.4))
    .add(flash);
  const shieldColor = lifeColor.mul(intensity).mul(2.0).add(lifeColor.mul(flowNoise).mul(fresnel).mul(uniforms.flowIntensity));
  const edgeColor = mix(uniforms.noiseEdgeColor, lifeColor, float(1).sub(uniforms.life));
  const edgeGlow = edgeColor.mul(revealEdge).mul(uniforms.noiseEdgeIntensity);

  let alpha = clamp(
    intensity.mul(revealMask).add(revealEdge.mul(uniforms.noiseEdgeIntensity)),
    0,
    1
  );

  alpha = alpha
    .mul(smoothstep(float(-1.0), uniforms.fadeStart, positionLocal.y))
    .mul(uniforms.opacity);

  material.colorNode = shieldColor.add(edgeGlow);
  material.opacityNode = alpha;
  material.userData.tslUniforms = uniforms;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.02, 64, 48),
    material
  );

  mesh.userData.baseRadius = radius;
  mesh.renderOrder = 10;
  syncShieldParams(mesh, params);

  return mesh;
}

export async function createEarth({
  radius = 1,
  earthUrl = `${ASSET_ROOT}/texture/earth.jpg`,
  boundaryUrl = `${ASSET_ROOT}/texture/boundary.jpg`,
  params = {}
} = {}) {
  const root = new THREE.Group();
  const resources = [];

  const innerSphere = createInnerSphere(radius);
  const shield = createShield(radius, params);
  root.add(innerSphere, shield);
  resources.push(innerSphere, shield);

  const [landLayer, borderLayer] = await Promise.all([
    createPointLayer({
      maskUrl: earthUrl,
      sampleCount: 30000,
      threshold: 1.0,
      radius,
      dotSize: 0.033,
      materialOptions: {
        color: params.landColor ?? '#6d96cc',
        dotFalloff: 2.95,
        dotCoreBoost: 1.45,
        sizeVariation: 0.48,
        brightnessVariation: 0.13,
        twinkleIntensity: params.landTwinkleIntensity ?? 2.0,
        twinkleSpeed: 3.2,
        twinkleSharpness: 2.6
      }
    }),
    createPointLayer({
      maskUrl: boundaryUrl,
      sampleCount: 80000,
      threshold: 0.18,
      radius: radius * 1.003,
      dotSize: 0.024,
      materialOptions: {
        color: params.borderColor ?? '#00dfff',
        dotFalloff: 3.2,
        dotCoreBoost: 3.0,
        sizeVariation: 0.35,
        brightnessVariation: 0.25,
        twinkleIntensity: params.borderTwinkleIntensity ?? 2.5,
        twinkleSpeed: 4.1,
        twinkleSharpness: 2.8
      }
    })
  ]);

  root.add(landLayer.mesh, borderLayer.mesh);
  resources.push(landLayer.mesh, borderLayer.mesh);

  const updateParams = (nextParams = {}) => {
    landLayer.material.userData.tslUniforms.color.value.set(nextParams.landColor ?? '#6d96cc');
    landLayer.material.userData.tslUniforms.dotScale.value = nextParams.landDotScale ?? 1;
    landLayer.material.userData.tslUniforms.twinkleIntensity.value = nextParams.landTwinkleIntensity ?? 2.0;

    borderLayer.material.userData.tslUniforms.color.value.set(nextParams.borderColor ?? '#00dfff');
    borderLayer.material.userData.tslUniforms.dotScale.value = nextParams.borderDotScale ?? 1;
    borderLayer.material.userData.tslUniforms.twinkleIntensity.value = nextParams.borderTwinkleIntensity ?? 2.5;

    syncShieldParams(shield, nextParams);
  };

  updateParams(params);

  return {
    object: root,
    update(delta = 0) {
      shield.material.userData.tslUniforms.time.value += delta;
    },
    updateParams,
    dispose() {
      resources.forEach(mesh => {
        root.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
    }
  };
}
