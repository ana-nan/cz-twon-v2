import type { Point } from '../data/town';
import type { WorldStyle } from '../data/worldStyle';

export type GroundEllipse = Point & { rx: number; ry: number };
type GuardianPlacement = {
  anchor: Point;
  size: number;
  footprint: GroundEllipse;
  approach: Point;
  image: string;
  eyes: { x: number; y: number; rx: number; ry: number }[];
  tail: Point;
  core: Point;
};

// Scene-space anchors are the front edge of the plinth, not the image center.
// Each world has its own shore: the birthday props keep their existing position.
export const guardianPlacements: Record<WorldStyle, GuardianPlacement> = {
  classic: {
    anchor: { x: 1340, y: 414 }, size: 228,
    footprint: { x: 1333, y: 403, rx: 53, ry: 15 },
    approach: { x: 1280, y: 430 }, image: 'guardian/classic.png',
    eyes: [{ x: 302, y: 425, rx: 30, ry: 53 }, { x: 460, y: 451, rx: 44, ry: 56 }],
    tail: { x: 813, y: 659 }, core: { x: 388, y: 639 },
  },
  pixel: {
    anchor: { x: 1400, y: 548 }, size: 182,
    footprint: { x: 1399, y: 538, rx: 43, ry: 12 },
    approach: { x: 1340, y: 558 }, image: 'guardian/pixel.png',
    eyes: [{ x: 328, y: 400, rx: 30, ry: 51 }, { x: 467, y: 433, rx: 42, ry: 53 }],
    tail: { x: 861, y: 606 }, core: { x: 431, y: 611 },
  },
};
