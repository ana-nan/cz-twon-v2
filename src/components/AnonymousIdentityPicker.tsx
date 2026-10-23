import { asset } from '../data/town';
import { useRef, useState, type ChangeEvent } from 'react';
import { identityAvatars, type AnonymousIdentity } from '../data/anonymousIdentity';
import { useAnonymousIdentity } from '../hooks/useAnonymousIdentity';
export function AnonymousAvatar({identity}:{identity?:AnonymousIdentity}) {
 return <span className="identity-avatar" style={{background:identity?.color??'#65768c'}} aria-hidden="true">{identity?.image||identity?.avatar?<img src={identity.image??asset(`characters/${identity.avatar}.png`)} alt=""/>:identity?.symbol??'◇'}</span>;
}
export function AnonymousIdentityPicker({identity,onSave,onClose,title='匿名分身'}:{title?:string;identity:AnonymousIdentity;onSave:(value:AnonymousIdentity)=>void;onClose:()=>void}) {
 const [draft,setDraft]=useState(identity);
 const upload=useRef<HTMLInputElement>(null);
 const [error,setError]=useState('');
 async function chooseImage(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>300*1024){setError('请选择 300 KB 以内的 PNG、JPG 或 WebP 头像。');return;}
  const reader=new FileReader();reader.onload=()=>{setDraft(current=>({...current,image:String(reader.result),avatar:undefined}));setError('');};reader.onerror=()=>setError('头像读取失败，请重试。');reader.readAsDataURL(file);
 }
 return <section className="identity-editor" aria-label={title} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}}}>
  <header><strong>{title}</strong><button type="button" onClick={onClose} aria-label="关闭身份设置">×</button></header>
  <div className="identity-custom"><AnonymousAvatar identity={draft}/><label>昵称<input autoFocus value={draft.name} maxLength={20} onChange={event=>setDraft({...draft,name:event.target.value})} placeholder="输入昵称"/></label></div>
  <div className="identity-avatar-choices" role="group" aria-label="选择匿名头像">{identityAvatars.slice(0,6).map(avatar=><button key={avatar} type="button" aria-label={'选择头像 '+avatar} aria-pressed={!draft.image&&draft.avatar===avatar} onClick={()=>setDraft({...draft,avatar,image:undefined})}><img src={asset(`characters/${avatar}.png`)} alt=""/></button>)}</div>
  <button type="button" className="identity-upload" onClick={()=>upload.current?.click()}>上传头像</button><input ref={upload} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={chooseImage}/>
  {error&&<p className="identity-error" role="alert">{error}</p>}
  <footer><button type="button" onClick={onClose}>取消</button><button type="button" className="identity-save" disabled={!draft.name.trim()} onClick={()=>{onSave({...draft,name:draft.name.trim()});onClose();}}>保存</button></footer>
 </section>;
}
export function AnonymousIdentityPanel({compact=false}:{compact?:boolean}) {
 const {identity,save,error}=useAnonymousIdentity();const [open,setOpen]=useState(false);
 return <div className={compact?"identity-menu":"anonymous-profile-panel"}>{compact?<button className="identity-menu-trigger" type="button" onClick={()=>setOpen(!open)} aria-expanded={open}><AnonymousAvatar identity={identity}/><span>身份</span><span aria-hidden="true">⌄</span></button>:<><div className="anonymous-profile-summary"><AnonymousAvatar identity={identity}/><div><small>你的匿名身份</small><strong>{identity.name}</strong><p>不展示小镇昵称与装扮</p></div><button type="button" onClick={()=>setOpen(!open)} aria-expanded={open}>选择 / 设计身份</button></div></>}{open&&<AnonymousIdentityPicker identity={identity} onSave={save} onClose={()=>setOpen(false)}/>}{error&&<p role="status">身份暂时仅在本次打开期间保留。</p>}</div>;
}
