import { memo, useEffect, useRef, useState, type RefObject } from 'react';
import { asset } from '../data/town';
import type { WorldStyle } from '../data/worldStyle';
import type { WorldRuntimeInput } from './types';
import { createMaterialMap, worldMaterials } from './materials';
import { createMaterialRenderer } from './materialRenderer';
import './world-environment.css';

const loadImage = (path: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Scene asset unavailable'));
  image.src = asset(path);
});

type Props = { style: WorldStyle; night: boolean; birthday: boolean; runtime: RefObject<WorldRuntimeInput> };

export const WorldEnvironment = memo(function WorldEnvironment({ style, night, birthday, runtime }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [contextVersion, setContextVersion] = useState(0);
  const scene = worldMaterials[style];

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let alive = true, frame = 0, previous = 0;
    let renderer: ReturnType<typeof createMaterialRenderer> | undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReady(false);
    runtime.current.isWater = undefined;

    const draw = (now: number) => {
      if (!alive || document.hidden || !renderer) return;
      if (!previous || now - previous >= 15) {
        renderer.frame(previous ? Math.min((now - previous) / 1000, .08) : 0, runtime.current, reduced.matches);
        previous = now;
      }
      frame = requestAnimationFrame(draw);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (!document.hidden && renderer) frame = requestAnimationFrame(draw);
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
      setReady(false);
    };
    const contextRestored = () => setContextVersion(version => version + 1);
    element.addEventListener('webglcontextlost', contextLost);
    element.addEventListener('webglcontextrestored', contextRestored);
    document.addEventListener('visibilitychange', resume);

    Promise.all([loadImage(scene.day), loadImage(scene.night)]).then(([dayImage, nightImage]) => {
      if (!alive) return;
      const materials = createMaterialMap(dayImage, style);
      runtime.current.isWater = materials.isWater;
      renderer = createMaterialRenderer(element, dayImage, nightImage, materials.pixels, style);
      renderer.frame(0, runtime.current, reduced.matches);
      setReady(true);
      resume();
    }).catch(error => {
      // The original day/night artwork is also the graceful WebGL fallback.
      if (alive) console.warn('Living world uses its still-art fallback:', error);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', resume);
      element.removeEventListener('webglcontextlost', contextLost);
      element.removeEventListener('webglcontextrestored', contextRestored);
      renderer?.dispose();
      runtime.current.isWater = undefined;
    };
  }, [scene, style, runtime, contextVersion]);

  return <>
    <div className={`world-environment environment-${style} ${night ? 'environment-night' : ''}`} aria-label="创智龙广场">
      {!ready && <>
        <img className="world-still" src={asset(scene.day)} alt="" draggable={false}/>
        <img className="world-still world-still-night" src={asset(scene.night)} alt="" draggable={false}/>
      </>}
      <canvas ref={canvas} className={`world-materials ${ready ? 'is-ready' : ''}`} width={1600} height={900} aria-hidden="true"/>
    </div>
    {style === 'pixel' && birthday && <div className="pixel-birthday" role="img" aria-label="9·12 生日桌">
      <img src={asset('pixel/birthday.png')} alt="" draggable={false}/>
    </div>}
  </>;
});
