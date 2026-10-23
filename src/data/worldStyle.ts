export type WorldStyle = 'classic' | 'pixel';
export function readWorldStyle(): WorldStyle {
  try { return localStorage.getItem('town-world-style') === 'pixel' ? 'pixel' : 'classic'; }
  catch { return 'classic'; }
}
