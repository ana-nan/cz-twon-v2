import { useEffect, useRef, useState } from 'react';
import type { AnonymousIdentity } from '../data/anonymousIdentity';
import { useAnonymousIdentity } from '../hooks/useAnonymousIdentity';
import { AnonymousAvatar, AnonymousIdentityPicker } from './AnonymousIdentityPicker';
export function IdentityMenu({profile,onSave}:{profile:AnonymousIdentity;onSave:(value:AnonymousIdentity)=>void}) {
  const anonymous=useAnonymousIdentity();
  const [view,setView]=useState<'closed'|'list'|'public'|'anonymous'>('closed');
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setView('closed');};
    document.addEventListener('pointerdown',outside);
    return ()=>document.removeEventListener('pointerdown',outside);
  },[]);
  return <div className="identity-menu" ref={root} onKeyDown={event=>{if(event.key==='Escape'&&view!=='closed'){event.preventDefault();event.stopPropagation();setView('closed');}}}>
    <button className="identity-menu-trigger" onClick={()=>setView(view==='closed'?'list':'closed')} aria-expanded={view!=='closed'}><AnonymousAvatar identity={profile}/><span>{profile.name}</span><span aria-hidden="true">⌄</span></button>
    {view==='list'&&<div className="identity-account-list">
      <button onClick={()=>setView('public')}><AnonymousAvatar identity={profile}/><span><small>我的身份</small><strong>{profile.name}</strong></span><b>编辑</b></button>
      <button onClick={()=>setView('anonymous')}><AnonymousAvatar identity={anonymous.identity}/><span><small>匿名分身</small><strong>{anonymous.identity.name}</strong></span><b>编辑</b></button>
    </div>}
    {(view==='public'||view==='anonymous')&&<AnonymousIdentityPicker key={view} title={view==='public'?'我的身份':'匿名分身'} identity={view==='public'?profile:anonymous.identity} onSave={view==='public'?onSave:anonymous.save} onClose={()=>setView('list')}/>}
  </div>;
}
