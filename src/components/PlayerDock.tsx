import { characterArt } from '../data/characterArt';
import type { WorldStyle } from '../data/worldStyle';
import { useState } from 'react';
import { outfits, type Outfit } from '../data/town';
import { Icon } from './Icon';
import { GameGlyph } from './GameGlyph';

type Props = { worldStyle:WorldStyle; outfit: Outfit; onOutfit: (outfit: Outfit) => void; onWardrobe: () => void; onMessage: (text: string) => void };
export function PlayerDock({ worldStyle, outfit, onOutfit, onWardrobe, onMessage }: Props) {
  const [message, setMessage] = useState('');
  const quickOutfits = [outfits[1], outfits[2], outfits[7]];
  return <div className="player-dock">
    <button className="player-portrait" onClick={onWardrobe} aria-label="我的小龙，打开衣橱"><span className="portrait-art"><img src={characterArt(outfit,worldStyle)} alt="我的小龙"/></span><span className="player-level">Lv.1</span><span className="level-track"><i/></span></button>
    <div className="wardrobe-dock"><button className="wardrobe-label" onClick={onWardrobe}><GameGlyph name="shirt"/><span>换装</span></button><div className="wardrobe-slots">{quickOutfits.map(item => <button key={item.id} className={`wardrobe-slot slot-${item.id} ${outfit === item.id ? 'equipped' : ''}`} aria-label={`穿上${item.name}`} aria-pressed={outfit === item.id} title={item.name} onClick={() => onOutfit(item.id)}><img src={characterArt(item.id,worldStyle)} alt=""/>{outfit === item.id && <span className="equipped-check">✓</span>}</button>)}<button className="wardrobe-slot more-outfits" onClick={onWardrobe} aria-label="更多装扮"><Icon name="plus" size={34}/></button></div></div>
    <form className="chat-input" onSubmit={event => { event.preventDefault(); if (message.trim()) { onMessage(message.trim()); setMessage(''); } }}><Icon name="chat" size={18}/><input value={message} maxLength={60} onChange={event => setMessage(event.target.value)} placeholder="和广场上的小伙伴说句话…" aria-label="广场聊天"/><button disabled={!message.trim()} aria-label="发送广场消息"><Icon name="send" size={19}/></button></form>
  </div>;
}
