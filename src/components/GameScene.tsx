import type { WorldStyle } from '../data/worldStyle';
import { PixelWorld } from './PixelWorld';
import { PixelDragon } from './PixelDragon';
import { CircleNoticeboard } from './CircleNoticeboard';
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { WORLD, asset, scenePlaces, getPlace, type Outfit, type Place } from '../data/town';
import { AmbientLife } from './AmbientLife';
import { useNpcLife } from '../hooks/useNpcLife';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { Character } from './Character';
import { EmoteGlyph, type EmoteName } from './EmoteGlyph';

type Props = { worldStyle: WorldStyle; zoom: number; night: boolean; outfit: Outfit; disabled: boolean; travel: { place: Place; sequence: number } | null; selected: Place | null; message: string; birthdayVisible: boolean; onVisit: (place: Place) => void; onInteract: (place: Place) => void };
const EMOTES: EmoteName[] = ['happy', 'love', 'wow', 'angry', 'tear', 'shy'];
export function GameScene({ worldStyle, zoom, night, outfit, disabled, travel, message, birthdayVisible, onVisit, onInteract }: Props) {
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: WORLD.width, height: WORLD.height });
  const [nearest, setNearest] = useState<Place | null>(null);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [emote, setEmote] = useState<{ glyph: EmoteName; sequence: number } | null>(null);
  const emoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movement = usePlayerMovement(disabled, () => { if (nearest) onInteract(nearest); }, () => setWheelOpen(value => !value), worldStyle);
  const townLife = useNpcLife(disabled, worldStyle==='classic'&&birthdayVisible, worldStyle==='pixel'?{x:800+(movement.position.x-875)/.75,y:690+(movement.position.y-535)/.65}:movement.position);
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
      <div className={`scene-canvas ${movement.position.x > 275 && movement.position.x < 505 && movement.position.y > 330 && movement.position.y < 440 ? 'on-stepping-stones' : ''}`} ref={canvas} style={{ transform: `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${scale})` }} onPointerDown={event => {
        if (disabled || event.button !== 0 || (event.target as HTMLElement).closest('button')) return;
        setWheelOpen(false);
        const rect = canvas.current!.getBoundingClientRect();
        movement.walkTo({ x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale });
        (document.activeElement as HTMLElement)?.blur();
      }}>
        {worldStyle==='pixel'?<PixelWorld night={night} birthday={birthdayVisible}/>:<><img className="landscape landscape-day" src={asset('plaza-circle-day.png')} alt="环形台阶围绕中央活动区的创智龙下沉广场" draggable={false} />
        <img className="landscape landscape-night" src={asset('plaza-circle-night.png')} alt="暖灯照亮的创智龙夜间广场" aria-hidden={!night} draggable={false} /></>}
        {night && worldStyle==='classic' && <div className="night-atmosphere" aria-hidden="true">{Array.from({length:32},(_,i) => <i key={i} style={{left:`${15+(i*37)%72}%`,top:`${6+(i*19)%23}%`,animationDelay:`${i*.6}s`}}/>)}<span className="shooting-star"/><span className="shooting-star shooting-star-second"/><span className="night-fireflies">{Array.from({length:8},(_,i) => <b key={i} style={{left:`${12+(i*31)%77}%`,top:`${52+(i*13)%30}%`,animationDelay:`${i*.9}s`}}/>)}</span></div>}
        {scenePlaces.filter(place => place.id === 'heart').map(place => <Fragment key={place.id}>
          <button type="button" className="destination-hotspot" aria-label="进入活动岛" style={{ left: worldStyle==='pixel'?266:place.position.x, top: worldStyle==='pixel'?270:place.position.y, width: worldStyle==='pixel'?280:place.width, height: worldStyle==='pixel'?180:place.height }} onClick={() => onVisit(place)}><span className="destination-halo"/></button>
        </Fragment>)}
        <button className="destination-hotspot" aria-label="创智圈：打开创智圈" title="看看小镇的新动态" style={{left:235,top:worldStyle==='pixel'?775:730,width:330,height:160}} onClick={()=>onVisit(getPlace('notice'))}><span className="destination-halo"/></button>
        <button className="venue-ui-card island-ui-card" onClick={()=>onVisit(getPlace('heart'))}><span className="venue-icon">⚑</span><span><strong>活动岛</strong><small>点击进入 · 一起参加活动</small></span><b>›</b></button>
        <CircleNoticeboard onOpen={()=>onVisit(getPlace('notice'))}/>
        <div className="circle-residents" aria-label="围坐交流的小龙">
          {(worldStyle==='pixel'?[{id:'player',x:156,y:674,label:'晴天小龙',anonymous:false},{id:'mushroom',x:292,y:674,label:'蘑菇小龙',anonymous:false},{id:'player',x:304,y:728,label:'匿名龙',anonymous:true}]:[{id:'player',x:146,y:657,label:'晴天小龙',anonymous:false},{id:'mushroom',x:250,y:647,label:'蘑菇小龙',anonymous:false},{id:'player',x:345,y:673,label:'匿名龙',anonymous:true}]).map(person=><button key={person.label} className={'circle-resident '+(person.anonymous?'anonymous-resident':'')} style={{left:person.x,top:person.y,zIndex:person.y}} aria-label={person.label+'：加入创智圈讨论'} onClick={()=>onVisit(getPlace(person.anonymous?'voice':'notice'))}><span className="resident-body">{worldStyle==='pixel'?<PixelDragon outfit={person.id as Outfit}/>:<img src={asset('characters/'+person.id+'.png')} alt="" draggable={false}/>}</span>{person.anonymous&&<span className="anonymous-resident-label">匿名</span>}</button>)}
        </div>
        {worldStyle==='classic'&&<AmbientLife/>}
        {worldStyle==='classic' && birthdayVisible && <div className="birthday-installation" role="img" aria-label="9·12 生日布置：大横幅、气球簇、蛋糕、礼物堆与生日祝福板"><img src={asset('seasonal/birthday-912-rich.png')} alt="" draggable={false}/></div>}
        {worldStyle==='classic' && birthdayVisible && townLife.celebrating && <div className="birthday-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${index * .13}s`, background: ['#df97ab','#dfc87f','#91c9d1','#baacdb'][index % 4] }}/>)}</div>}
        {movement.target && <span className="walk-target" style={{ left: movement.target.x, top: movement.target.y }} />}
        {townLife.characters.map(person => <Character pixel={worldStyle==='pixel'} key={person.name} {...person} height={worldStyle==='pixel'?82:118} position={worldStyle==='pixel'?{x:875+(person.position.x-800)*.75,y:535+(person.position.y-690)*.65}:person.position} onClick={() => townLife.greet(person.name)} />)}
        {wheelOpen && <div className="emote-wheel" style={{ left: anchorX, top: anchorY, zIndex: Math.round(movement.position.y) + 60 }} role="menu" aria-label="表情轮盘">{EMOTES.map((name, index) => { const angle = (-170 + index * 32) * Math.PI / 180; return <button key={name} role="menuitem" aria-label={`表情 ${name}`} style={{ left: Math.cos(angle) * 92, top: Math.sin(angle) * 92, animationDelay: `${index * 45}ms` }} onClick={() => pickEmote(name)}><EmoteGlyph name={name}/></button>; })}</div>}
        {emote && <span key={emote.sequence} className="emote-pop" style={{ left: anchorX, top: anchorY - 82, zIndex: Math.round(movement.position.y) + 61 }}><EmoteGlyph name={emote.glyph}/></span>}
        <Character pixel={worldStyle==='pixel'} name="我" player height={worldStyle==='pixel'?88:100} outfit={outfit} position={movement.position} walking={movement.moving} left={movement.left} bubble={message} onClick={() => setWheelOpen(value => !value)} />
      </div>
    </div>
  </section>;
}
