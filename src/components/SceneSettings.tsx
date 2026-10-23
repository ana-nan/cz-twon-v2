import type { WorldStyle } from '../data/worldStyle';
import { PixelWorld } from './PixelWorld';
import { asset } from '../data/town';
type Props = {worldStyle:WorldStyle;onWorldStyle:(value:WorldStyle)=>void; night: boolean; onNight: (value: boolean) => void; birthday: boolean; onBirthday: () => void; music: boolean; onMusic: () => void; zoom: number; onZoom: (value: number) => void };
export function SceneSettings({ worldStyle, onWorldStyle, night, onNight, birthday, onBirthday, music, onMusic, zoom, onZoom }: Props) {
  return <div className="scene-preferences">
    <section className="world-style-picker" aria-label="世界风格"><h3>世界风格</h3><div className="world-style-options"><button aria-pressed={worldStyle==='classic'} onClick={()=>onWorldStyle('classic')}><span className="style-preview"><img src={asset('plaza-circle-day.png')} alt="经典小镇预览"/></span><span className="style-choice-label"><strong>经典小镇</strong><small>温暖 · 细腻</small><b>{worldStyle==='classic'?'✓':''}</b></span></button><button aria-pressed={worldStyle==='pixel'} onClick={()=>onWorldStyle('pixel')}><span className="style-preview pixel-preview"><PixelWorld/></span><span className="style-choice-label"><strong>像素小镇</strong><small>轻巧 · 复古</small><b>{worldStyle==='pixel'?'✓':''}</b></span></button></div></section>
    <div className="lighting-options" aria-label="选择昼夜"><button className={!night ? 'chosen' : ''} aria-pressed={!night} onClick={() => onNight(false)}><span>☀</span><strong>晴日漫游</strong><small>阳光、微风与湖面</small></button><button className={night ? 'chosen' : ''} aria-pressed={night} onClick={() => onNight(true)}><span>☾</span><strong>星夜小聚</strong><small>星光、暖灯与萤火</small></button></div>
    <div className="preference-row"><div><strong>节日布置</strong><small>9·12 生日横幅与蛋糕</small></div><button className="preference-switch" role="switch" aria-label="节日布置" aria-checked={birthday} onClick={onBirthday}><i/></button></div>
    <div className="preference-row"><div><strong>小镇音乐</strong><small>散步时的轻柔背景音乐</small></div><button className="preference-switch" role="switch" aria-label="小镇音乐" aria-checked={music} onClick={onMusic}><i/></button></div>
    <div className="preference-row"><div><strong>地图视角</strong><small>拉近一点，看看身边的小事</small></div><div className="settings-zoom"><button disabled={zoom <= 1} aria-label="拉远视角" onClick={() => onZoom(Math.max(1, +(zoom-.15).toFixed(2)))}>−</button><button onClick={() => onZoom(1)} aria-label="恢复默认视角">{zoom.toFixed(1)}×</button><button disabled={zoom >= 1.6} aria-label="拉近视角" onClick={() => onZoom(Math.min(1.6, +(zoom+.15).toFixed(2)))}>+</button></div></div>
  </div>;
}
