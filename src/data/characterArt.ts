import { asset, loadCustomDragon, type Outfit } from './town';
import type { WorldStyle } from './worldStyle';

/** Resolve one outfit consistently for the world, wardrobe and player portrait. */
export function characterArt(outfit: Outfit, style: WorldStyle = 'classic'): string {
  if (outfit === 'custom') return loadCustomDragon() ?? asset(style === 'pixel' ? 'pixel/dragon.png' : 'characters/player.png');
  if (style === 'pixel') return asset(outfit === 'player' ? 'pixel/dragon.png' : `pixel/characters/${outfit}.png`);
  return asset(`characters/${outfit}.png`);
}
