import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { WORLD, asset, scenePlaces, getPlace, type Outfit, type Place } from '../data/town';
import { AmbientLife } from './AmbientLife';
import { useNpcLife } from '../hooks/useNpcLife';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { Character } from './Character';
import { EmoteGlyph, type EmoteName } from './EmoteGlyph';

type Props = { zoom: number; night: boolean; outfit: Outfit; disabled: boolean; travel: { place: Place; sequence: number } | null; selected: Place | null; message: string; birthdayVisible: boolean; onVisit: (place: Place) => void; onInteract: (place: Place) => void };
const EMOTES: EmoteName[] = ['happy', 'love', 'wow', 'angry', 'tear', 'shy'];
export function GameScene({ zoom, night, outfit, disabled, travel, message, birthdayVisible, onVisit, onInteract }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: WORLD.width, height: WORLD.height });
  const [nearest, setNearest] = useState<Place | null>(null);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [emote, setEmote] = useState<{ glyph: EmoteName; sequence: number } | null>(null);
  const emoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movement = usePlayerMovement(disabled, () => { if (nearest) onInteract(nearest); }, () => setWheelOpen(value => !value));
  const townLife = useNpcLife(disabled, birthdayVisible, movement.position);
  const scale = Math.max(size.width / WORLD.width, size.height / WORLD.height) * zoom;
  const cameraX = Math.max(size.width - WORLD.width * scale, Math.min(0, size.width / 2 - movement.position.x * scale));
  const cameraY = Math.max(size.height - WORLD.height * scale, Math.min(0, size.height / 2 - movement.position.y * scale));

  useLayoutEffect(() => {
    const element = viewport.current!;
    const resize = () => setSize({ width: element.clientWidth, height: element.clientHeight });
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (travel) movement.walkTo(travel.place.approach); }, [travel, movement.walkTo]);
  useEffect(() => { if (disabled) setWheelOpen(false); }, [disabled]);
  useEffect(() => () => { if (emoteTimer.current) clearTimeout(emoteTimer.current); }, []);
  useEffect(() => {
    const close = [...scenePlaces].sort((a, b) => Math.hypot(a.approach.x - movement.position.x, a.approach.y - movement.position.y) - Math.hypot(b.approach.x - movement.position.x, b.approach.y - movement.position.y))[0];
    setNearest(Math.hypot(close.approach.x - movement.position.x, close.approach.y - movement.position.y) < 110 ? close : null);
  }, [movement.position]);
  const pickEmote = (glyph: EmoteName) => {
    setWheelOpen(false);
    setEmote(current => ({ glyph, sequence: (current?.sequence ?? 0) + 1 }));
    if (emoteTimer.current) clearTimeout(emoteTimer.current);
    emoteTimer.current = setTimeout(() => setEmote(null), 3200);
  };
  const anchorX = movement.position.x;
  const anchorY = movement.position.y - 50;
  return <section className="scene-shell" aria-label="可漫游的创智龙广场">
    <div className="scene-viewport" ref={viewport}>
      <div className="scene-canvas" ref={canvas} style={{ transform: `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${scale})` }} onPointerDown={event => {
        if (disabled || event.button !== 0 || (event.target as HTMLElement).closest('button')) return;
        setWheelOpen(false);
        const rect = canvas.current!.getBoundingClientRect();
        movement.walkTo({ x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale });
        (document.activeElement as HTMLElement)?.blur();
      }}>
        <img className="landscape landscape-day" src={asset('plaza-noticeboard-day.png')} alt="环形台阶围绕中央活动区的创智龙下沉广场" draggable={false} />
        <img className="landscape landscape-night" src={asset('plaza-noticeboard-night.png')} alt="暖灯照亮的创智龙夜间广场" aria-hidden={!night} draggable={false} />
        {night && <div className="night-atmosphere" aria-hidden="true">{Array.from({length:32},(_,i) => <i key={i} style={{left:`${15+(i*37)%72}%`,top:`${6+(i*19)%23}%`,animationDelay:`${i*.6}s`}}/>)}<span className="shooting-star"/><span className="shooting-star shooting-star-second"/><span className="night-fireflies">{Array.from({length:8},(_,i) => <b key={i} style={{left:`${12+(i*31)%77}%`,top:`${52+(i*13)%30}%`,animationDelay:`${i*.9}s`}}/>)}</span></div>}
        {scenePlaces.filter(place => place.id === 'heart').map(place => <Fragment key={place.id}>
          <button type="button" className="destination-hotspot" aria-label="进入活动岛" style={{ left: place.position.x, top: place.position.y, width: place.width, height: place.height }} onClick={() => movement.walkTo({x:245,y:337})}><span className="destination-halo"/></button>
        </Fragment>)}
        <button className="destination-hotspot" aria-label="小镇公告：打开小镇日报" title="看看小镇的新动态" style={{left:145,top:654,width:275,height:195}} onClick={()=>onVisit(getPlace('notice'))}><span className="destination-halo"/></button>
        <AmbientLife/>
        {birthdayVisible && <div className="birthday-installation" role="img" aria-label="9·12 生日布置：大横幅、气球簇、蛋糕、礼物堆与生日祝福板"><img src={asset('seasonal/birthday-912-rich.png')} alt="" draggable={false}/></div>}
        {birthdayVisible && townLife.celebrating && <div className="birthday-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${index * .13}s`, background: ['#df97ab','#dfc87f','#91c9d1','#baacdb'][index % 4] }}/>)}</div>}
        {movement.target && <span className="walk-target" style={{ left: movement.target.x, top: movement.target.y }} />}
        {townLife.characters.map(person => <Character key={person.name} {...person} onClick={() => townLife.greet(person.name)} />)}
        {wheelOpen && <div className="emote-wheel" style={{ left: anchorX, top: anchorY, zIndex: Math.round(movement.position.y) + 60 }} role="menu" aria-label="表情轮盘">{EMOTES.map((name, index) => { const angle = (-170 + index * 32) * Math.PI / 180; return <button key={name} role="menuitem" aria-label={`表情 ${name}`} style={{ left: Math.cos(angle) * 92, top: Math.sin(angle) * 92, animationDelay: `${index * 45}ms` }} onClick={() => pickEmote(name)}><EmoteGlyph name={name}/></button>; })}</div>}
        {emote && <span key={emote.sequence} className="emote-pop" style={{ left: anchorX, top: anchorY - 82, zIndex: Math.round(movement.position.y) + 61 }}><EmoteGlyph name={emote.glyph}/></span>}
        <Character name="我" player height={100} outfit={outfit} position={movement.position} walking={movement.moving} left={movement.left} bubble={message} onClick={() => setWheelOpen(value => !value)} />
      </div>
      {nearest?.id === 'heart' && !disabled && <button className="island-enter-hint" onClick={()=>onInteract(nearest)}>进入活动岛 · E →</button>}
    </div>
  </section>;
}
