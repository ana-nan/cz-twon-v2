import type { Point } from '../data/town';

export type WorldRuntimeInput = {
  night: boolean;
  player: Point;
  impulses: { kind: 'water'; point: Point }[];
  isWater?: (point: Point) => boolean;
};

/** Ellipse enclosing a canopy, expressed in the 1600 × 900 world. */
export type Canopy = { x: number; y: number; rx: number; ry: number };
