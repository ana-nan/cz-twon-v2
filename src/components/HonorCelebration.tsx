import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { honors } from '../data/honors';

type Props = { honor?: typeof honors[number]; onDismiss: () => void; surface: string };
export function HonorCelebration({honor,onDismiss,surface}:Props) {
  const element=useRef<HTMLDivElement>(null);
  const [host,setHost]=useState<Element>(document.body);
  useEffect(()=>{setHost(document.querySelector('dialog[open]')??document.body);},[surface,honor?.id]);
  useEffect(()=>{
    if(!honor)return;
    const timer=window.setTimeout(onDismiss,5200);
    return ()=>window.clearTimeout(timer);
  },[honor?.id,onDismiss]);
  useEffect(()=>{
    if(!honor)return;
    const node=element.current;
    const frame=requestAnimationFrame(()=>{if(node?.isConnected){node.hidePopover?.();node.showPopover?.();}});
    return ()=>{cancelAnimationFrame(frame);if(node?.isConnected)node.hidePopover?.();};
  },[honor?.id,host,surface]);
  if(!honor)return null;
  return createPortal(<div ref={element} popover="manual" className="honor-unlock-layer" key={honor.id}>
    <div className="honor-unlock-card" role="status" aria-live="polite" aria-atomic="true">
      <div className="honor-burst" aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i} style={{'--angle':`${i*360/14}deg`,'--delay':`${i%4*.08}s`} as CSSProperties}/>)}</div>
      <div className="honor-unlock-emblem" aria-hidden="true"><span>{honor.symbol}</span></div>
      <div className="honor-unlock-copy"><small>✦ 新荣誉已解锁</small><strong>{honor.name}</strong><p>{honor.description}</p><span>已收录到你的荣誉墙</span></div>
      <button type="button" className="honor-unlock-close" aria-label="关闭荣誉提示" onClick={onDismiss}>×</button>
    </div>
  </div>,host);
}
