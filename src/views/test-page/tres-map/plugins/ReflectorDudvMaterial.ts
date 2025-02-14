import { GLSL3, Matrix3, Matrix4, NoBlending, RawShaderMaterial } from 'three';

const vertexShader = /* glsl */ `
in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

uniform mat3 uMapTransform;
uniform mat4 uMatrix;

out vec2 vUv;
out vec4 vCoord;
out vec3 vNormal;
out vec3 vToEye;

void main() {
    vUv = (uMapTransform * vec3(uv, 1.0)).xy;
    vCoord = uMatrix * vec4(position, 1.0);
    vNormal = normalMatrix * normal;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vToEye = cameraPosition - worldPosition.xyz;

    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D tMap;
uniform sampler2D tReflect;
uniform sampler2D tReflectBlur;
uniform float uReflectivity;

in vec2 vUv;
in vec4 vCoord;
in vec3 vNormal;
in vec3 vToEye;

out vec4 FragColor;

float random(vec2 co) {
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt = dot(co.xy, vec2(a, b));
    float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}

vec3 dither(vec3 color) {
    // Calculate grid position
    float grid_position = random(gl_FragCoord.xy);

    // Shift the individual colors differently, thus making it even harder to see the dithering pattern
    vec3 dither_shift_RGB = vec3(0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0);

    // Modify shift acording to grid position
    dither_shift_RGB = mix(2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position);

    // Shift the color by dither_shift
    return color + dither_shift_RGB;
}

void main() {
    vec2 reflectionUv = vCoord.xy / vCoord.w;

    vec4 dudv = texture(tMap, vUv);
    vec4 color = texture(tReflect, reflectionUv);

    vec4 blur;

    blur = texture(tReflectBlur, reflectionUv + dudv.rg / 256.0);
    color = mix(color, blur, smoothstep(1.0, 0.1, dudv.g));

    blur = texture(tReflectBlur, reflectionUv);
    color = mix(color, blur, smoothstep(0.5, 1.0, dudv.r));

    FragColor = color * mix(0.6, 0.75, dudv.g);

    // Fresnel term
    vec3 toEye = normalize(vToEye);
    float theta = max(dot(toEye, vNormal), 0.0);
    float reflectance = uReflectivity + (1.0 - uReflectivity) * pow((1.0 - theta), 5.0);

    FragColor = mix(vec4(0), FragColor, reflectance);

    #ifdef DITHERING
        FragColor.rgb = dither(FragColor.rgb);
    #endif

    FragColor.a = 1.0;
}
`;

export class ReflectorDudvMaterial extends RawShaderMaterial {
  constructor({
    map = null,
    reflectivity = 0,
    dithering = false
  }: { map?: any; reflectivity?: number; dithering?: boolean } = {}) {
    const parameters = {
      glslVersion: GLSL3,
      defines: {
        DITHERING: dithering
      },
      uniforms: {
        tMap: { value: null },
        tReflect: { value: null },
        tReflectBlur: { value: null },
        uMapTransform: { value: new Matrix3() },
        uMatrix: { value: new Matrix4() },
        uReflectivity: { value: reflectivity }
      },
      vertexShader,
      fragmentShader,
      blending: NoBlending
    };

    if (map) {
      map.updateMatrix();

      parameters.uniforms = Object.assign(parameters.uniforms, {
        tMap: { value: map },
        uMapTransform: { value: map.matrix }
      });
    }

    super(parameters);
  }
}
