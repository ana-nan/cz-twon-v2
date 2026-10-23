import type { WorldStyle } from '../data/worldStyle';
import type { Canopy } from './types';
import type { Point } from '../data/town';

export const worldMaterials: Record<WorldStyle, {
  day: string; night: string; horizon: number; canopies: Canopy[];
}> = {
  classic: {
    day: 'plaza-circle-day.png', night: 'plaza-circle-night.png', horizon: 307,
    canopies: [
      {x:105,y:55,rx:195,ry:123}, {x:1510,y:50,rx:195,ry:124},
      {x:114,y:245,rx:62,ry:77}, {x:370,y:253,rx:59,ry:77},
      {x:1155,y:300,rx:86,ry:87}, {x:1275,y:261,rx:68,ry:70},
      {x:1377,y:244,rx:90,ry:76}, {x:1560,y:268,rx:83,ry:80},
      {x:84,y:830,rx:171,ry:128}, {x:1515,y:834,rx:174,ry:128},
    ],
  },
  pixel: {
    day: 'pixel/plaza-day.png', night: 'pixel/plaza-night.png', horizon: 139,
    canopies: [
      {x:160,y:142,rx:66,ry:63}, {x:32,y:372,rx:95,ry:135},
      {x:125,y:442,rx:65,ry:62}, {x:366,y:454,rx:61,ry:57},
      {x:1570,y:387,rx:96,ry:142}, {x:1415,y:442,rx:67,ry:64},
      {x:1560,y:586,rx:76,ry:72}, {x:24,y:722,rx:100,ry:115},
      {x:132,y:847,rx:82,ry:94}, {x:1524,y:713,rx:109,ry:116},
      {x:1445,y:815,rx:68,ry:72},
    ],
  },
};

/** Material masks come from daylight colors inside scene-specific spatial regions.
 * The same water mask drives rendering and pointer interaction. No masks are
 * applied to characters, buildings or HUD. The result stays in GPU memory.
 */
export function createMaterialMap(image: HTMLImageElement, style: WorldStyle) {
  const width = 800, height = 450;
  const source = document.createElement('canvas');
  source.width = width; source.height = height;
  const ctx = source.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D is unavailable');
  ctx.drawImage(image, 0, 0, width, height);
  const original = ctx.getImageData(0, 0, width, height);
  const mask = ctx.createImageData(width, height);
  const scene = worldMaterials[style];
  const skyline = [[340,207],[450,214],[598,176],[754,218],[875,230],[1040,227],[1140,178],[1280,215],[1410,192]];
  const skyHeight = (x: number) => {
    for (let n = 1; n < skyline.length; n++) if (x <= skyline[n][0]) {
      const a = skyline[n - 1], b = skyline[n];
      return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
    }
    return 192;
  };
  const smooth = (low: number, high: number, value: number) => {
    const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
    return t * t * (3 - 2 * t);
  };
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const r = original.data[i] / 255, g = original.data[i + 1] / 255, b = original.data[i + 2] / 255;
    const wx = x * 2, wy = y * 2;
    const green = smooth(.015, .12, g - r) * smooth(.01, .15, g - b);
    const waterRegion = wy > scene.horizon && (style === 'pixel' || wy < 480);
    const water = waterRegion ? smooth(.12, .3, b - r) * smooth(-.025, .035, b - g) * smooth(.32, .55, b) : 0;
    let canopy = 0;
    for (const tree of scene.canopies) {
      const distance = Math.hypot((wx - tree.x) / tree.rx, (wy - tree.y) / tree.ry);
      canopy = Math.max(canopy, 1 - smooth(.65, 1.12, distance));
    }
    const ground = smooth(style === 'pixel' ? 340 : 360, 510, wy);
    mask.data[i] = Math.round(water * 255);
    mask.data[i + 1] = Math.round(canopy * green * 255);
    mask.data[i + 2] = Math.round(green * ground * (1 - canopy) * 255);
    const cloud = style === 'pixel'
      ? (1 - smooth(108, 131, wy)) * ((wx > 170 && wx < 397) ? 0 : 1)
      : (1 - smooth(skyHeight(wx) - 32, skyHeight(wx) - 9, wy))
        * smooth(340, 375, wx) * (1 - smooth(1375, 1410, wx))
        * ((wx > 850 && wx < 982 && wy > 130) ? 0 : 1);
    mask.data[i + 3] = Math.round(cloud * 255);
  }
  // Give moving foliage/cloud boundaries room to travel into the neighboring sky.
  // Ground and building geometry remain outside these material envelopes.
  const raw = mask.data.slice();
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    let leaves = raw[i + 1];
    for (const [dx, dy] of [[-3,0],[3,0],[0,-3],[0,3],[-2,-2],[2,2]]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) leaves = Math.max(leaves, raw[(ny * width + nx) * 4 + 1] * .85);
    }
    mask.data[i + 1] = leaves;
  }
  const isWater = (point: Point) => {
    const x = Math.floor(point.x / 2), y = Math.floor(point.y / 2);
    return x >= 0 && x < width && y >= 0 && y < height && mask.data[(y * width + x) * 4] > 180;
  };
  // Upload raw channels: a canvas would premultiply RGB by our cloud channel.
  return { pixels: mask, isWater };
}
