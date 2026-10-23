import type { WorldStyle } from '../data/worldStyle';
import type { WorldRuntimeInput } from './types';
import { worldMaterials } from './materials';

const vertex = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = vec2(aPosition.x * .5 + .5, .5 - aPosition.y * .5);
  gl_Position = vec4(aPosition, 0., 1.);
}`;

const fragment = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 result;
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uMaterials;
uniform float uTime;
uniform float uNightAmount;
uniform float uMotion;
uniform vec2 uPlayer;
uniform vec4 uRipples[4];
uniform vec4 uCanopies[12];
const vec2 WORLD = vec2(1600., 900.);

float field(vec2 p, float time) {
  return sin(p.x * .018 + p.y * .011 - time * .63) * .56
    + sin(p.x * .042 - p.y * .025 + time * .91) * .27
    + sin(p.x * .009 + p.y * .057 + time * .37) * .17;
}

void main() {
  vec2 p = vUv * WORLD;
  vec4 material = texture(uMaterials, vUv);
  // Keep stone edges, trunks and buildings still. Feather the water close to shore.
  float water = min(material.r, texture(uMaterials, vUv + vec2(0., .003)).r);
  water = min(water, texture(uMaterials, vUv - vec2(0., .003)).r);
  float canopy = material.g;
  float grass = material.b;
  float time = uTime;
  float gust = smoothstep(-.2, .95, sin(p.x * .004 - time * .55));
  float wind = field(p, time) * (.4 + gust * .6);

  vec2 flow = vec2(
    sin(p.y * .041 - time * .58) * 5.2 + sin(p.y * .086 + time * .86) * 2.4,
    sin(p.x * .024 + p.y * .055 - time * .61) * 1.6
  );
  vec2 foliage = vec2(0.);
  float weight = 0.;
  if (canopy > .001) for (int i = 0; i < 12; i++) {
    vec4 tree = uCanopies[i];
    if (tree.z < 1.) continue;
    vec2 local = (p - tree.xy) / tree.zw;
    float influence = 1. - smoothstep(.6, 1.15, length(local));
    if (influence < .001) continue;
    float height = pow(clamp((1. - local.y) * .5, 0., 1.), 1.5);
    float delayedWind = sin(time * .8 - tree.x * .003 + local.y * .7);
    float branch = sin(time * 1.6 + local.x * 2.4 - tree.x * .005);
    foliage += vec2((delayedWind * (7. + gust * 7.) + branch * 2.) * height,
      sin(time * 1.3 + local.x * 3.) * height * .8) * influence;
    weight += influence;
  }
  foliage /= max(1., weight);
  vec2 meadow = vec2(wind * 2.8, sin(p.x * .06 - time * 1.3) * .65);
  float nearPlayer = 1. - smoothstep(5., 38., length((p - uPlayer) * vec2(1., 1.4)));
  meadow.x += sign(p.x - uPlayer.x) * nearPlayer * 1.5;
  float cloudDrift = sin(time * .065 + p.x * .0006) * 17.;
  vec2 offset = flow * water + foliage * canopy + meadow * grass
    + vec2(cloudDrift, sin(time * .045) * 1.3) * material.a * (1. - uNightAmount);

  // A touch disturbs the existing reflection instead of drawing a graphic ring.
  for (int i = 0; i < 4; i++) {
    vec4 ripple = uRipples[i];
    float age = time - ripple.z;
    vec2 delta = (p - ripple.xy) * vec2(1., 2.6);
    float radius = length(delta);
    float band = exp(-pow((radius - age * 40.) / 13., 2.));
    float life = max(0., 1. - age / 3.);
    offset += normalize(delta + .001) * sin(radius * .35 - age * 12.)
      * band * life * 1.8 * ripple.w * water;
  }

  // Keep pixel silhouettes, but interpolate movement continuously to avoid jitter.
  offset *= uMotion;
  vec2 uv = clamp(vUv + offset / WORLD, vec2(.001), vec2(.999));
  vec3 daylight = texture(uDay, uv).rgb;
  vec3 night = texture(uNight, uv).rgb;
  vec3 artwork = mix(daylight, night, uNightAmount);

  float reflection = field(vec2(p.x * .45, p.y * 1.5), time * .4);
  float windLight = sin(p.x * .009 + p.y * .004 - time * .55);
  float grassLight = (gust - .5) * .08 + windLight * .024;
  artwork *= 1. + uMotion * (water * reflection * .048
    + canopy * windLight * .038 * (1. - uNightAmount * .6)
    + grass * grassLight * (1. - uNightAmount * .6));
  // Broad, soft cloud shadows share the wind direction across the ground.
  float cloudShadow = exp(-pow((p.x - 800. - sin(time * .09) * 680.) / 230., 2.)
    - pow((p.y - 655.) / 145., 2.));
  artwork *= 1. - cloudShadow * .045 * (1. - water) * (1. - uNightAmount) * uMotion;
  if (p.y < 125. && min(night.r, min(night.g, night.b)) > .7) {
    float smallStar = 1. - smoothstep(35., 52., distance(p, vec2(1240., 78.)));
    float pixelMoon = 1. - smoothstep(35., 52., distance(p, vec2(987., 65.)));
    artwork *= 1. - (1. - max(smallStar, pixelMoon)) * uNightAmount * uMotion
      * (.08 + .08 * sin(time * .85 + p.x * .2));
  }
  result = vec4(artwork, 1.);
}`;

/** Scene materials have independent time/response; React owns the social UI. */
export function createMaterialRenderer(
  canvas: HTMLCanvasElement,
  day: HTMLImageElement,
  night: HTMLImageElement,
  mask: ImageData,
  style: WorldStyle,
) {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) throw new Error('WebGL 2 is unavailable');
  const shaders: WebGLShader[] = [];
  const textures: WebGLTexture[] = [];
  const shader = (type: number, source: string) => {
    const item = gl.createShader(type);
    if (!item) throw new Error('Unable to create shader');
    shaders.push(item);
    gl.shaderSource(item, source); gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item) ?? 'Shader compilation failed');
    return item;
  };
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  if (!program || !buffer) throw new Error('Unable to create scene renderer');
  const dispose = () => {
    textures.forEach(item => gl.deleteTexture(item));
    shaders.forEach(item => gl.deleteShader(item));
    gl.deleteBuffer(buffer); gl.deleteProgram(program);
  };
  try {
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'Shader linking failed');
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    [day, night, mask].forEach((image, index) => {
      const texture = gl.createTexture();
      if (!texture) throw new Error('Unable to create scene texture');
      textures.push(texture);
      gl.activeTexture(gl.TEXTURE0 + index); gl.bindTexture(gl.TEXTURE_2D, texture);
      const filter = gl.LINEAR;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (image instanceof ImageData) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      }
      gl.uniform1i(gl.getUniformLocation(program, ['uDay', 'uNight', 'uMaterials'][index]), index);
    });
    gl.viewport(0, 0, canvas.width, canvas.height);
    const canopies = new Float32Array(12 * 4);
    worldMaterials[style].canopies.forEach((tree, index) => canopies.set([tree.x, tree.y, tree.rx, tree.ry], index * 4));
    gl.uniform4fv(gl.getUniformLocation(program, 'uCanopies[0]'), canopies);
  } catch (error) { dispose(); throw error; }

  const uniforms = Object.fromEntries(['uTime','uNightAmount','uPlayer','uRipples[0]','uMotion'].map(name => [name, gl.getUniformLocation(program, name)]));
  let time = 0, lighting = -1, rippleIndex = 0;
  const ripples = new Float32Array(16);
  return {
    dispose,
    frame(dt: number, input: WorldRuntimeInput, reduced: boolean) {
      if (gl.isContextLost()) return;
      time += reduced ? 0 : dt;
      const target = input.night ? 1 : 0;
      lighting = lighting < 0 || reduced ? target : lighting + (target - lighting) * Math.min(1, dt * 3);
      for (const impulse of input.impulses.splice(0)) {
        if (reduced) continue;
        ripples.set([impulse.point.x, impulse.point.y, time, 1], (rippleIndex++ % 4) * 4);
      }
      gl.uniform1f(uniforms.uTime, time);
      gl.uniform1f(uniforms.uNightAmount, lighting);
      gl.uniform1f(uniforms.uMotion, reduced ? 0 : 1);
      gl.uniform2f(uniforms.uPlayer, input.player.x, input.player.y);
      gl.uniform4fv(uniforms['uRipples[0]'], ripples);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
  };
}
