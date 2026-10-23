import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { asset, type PlaceId, type NoticeType, type Poll } from '../data/town';
import { type AnonymousIdentity } from '../data/anonymousIdentity';
import { useAnonymousIdentity } from '../hooks/useAnonymousIdentity';
import { AnonymousAvatar, AnonymousIdentityPicker } from './AnonymousIdentityPicker';

type Draft = {body:string;images:string[];withPoll:boolean;options:string[];category:PlaceId;noticeType:NoticeType};
function readDraft(category:PlaceId):Draft {
 const fallback:Draft={body:'',images:[],withPoll:false,options:['',''],category:category==='heart'?'heart':'notice',noticeType:'poster'};
 try {const d=JSON.parse(sessionStorage.getItem('town-compose-'+category)??'null');if(!d||typeof d.body!=='string')return fallback;return {body:d.body.slice(0,1500),images:Array.isArray(d.images)?d.images.filter((s:unknown)=>typeof s==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(s)).slice(0,3):[],withPoll:!!d.withPoll,options:Array.isArray(d.options)&&d.options.length>=2?d.options.filter((s:unknown)=>typeof s==='string').slice(0,6):['',''],category:category==='heart'?'heart':d.category==='voice'?'voice':'notice',noticeType:d.noticeType==='signal'?'signal':'poster'};}catch{return fallback;}
}
export function PostComposer({initialCategory='notice',publicName='我',publicAvatar=asset('characters/player.png'),onSubmit}:{publicName?:string;publicAvatar?:string;initialCategory?:PlaceId;onSubmit:(title:string,body:string,category:PlaceId,noticeType?:NoticeType,images?:string[],poll?:Poll,anonymousName?:string,identity?:AnonymousIdentity)=>void}) {
 const [draft,setDraft]=useState(()=>readDraft(initialCategory));
 const {identity,save,error:identityError}=useAnonymousIdentity();
 const [identityOpen,setIdentityOpen]=useState(false);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');

 const fileInput=useRef<HTMLInputElement>(null);
 const submitted=useRef(false);
 const draftKey=useRef('town-compose-'+initialCategory);
 const {body,images,withPoll,options,noticeType}=draft;
 const isActivity=initialCategory==='heart';
 const category:PlaceId=isActivity?'heart':draft.category==='voice'?'voice':'notice';
 const update=(value:Partial<Draft>)=>setDraft(current=>({...current,...value}));
 const choices=options.map(item=>item.trim());
 const validPoll=!withPoll||(body.trim()&&choices.length>=2&&choices.every(Boolean)&&new Set(choices).size===choices.length);
 const canPost=!!(body.trim()||images.length)&&!!validPoll&&!loading;
 useEffect(()=>{if(submitted.current)return;try{sessionStorage.setItem(draftKey.current,JSON.stringify(draft));}catch{/* Keep the draft in memory when storage is full. */}},[draft]);
 async function attach(event:ChangeEvent<HTMLInputElement>) {
  const files=Array.from(event.target.files??[]);event.target.value='';
  if(files.length+images.length>3){setError('最多添加 3 张图片。');return;}
  if(files.some(file=>file.size>800*1024||!['image/png','image/jpeg','image/webp'].includes(file.type))){setError('请选择 800 KB 以内的 PNG、JPG 或 WebP 图片。');return;}
  setLoading(true);setError('');
  try {const urls=await Promise.all(files.map(file=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file);})));setDraft(current=>({...current,images:[...current.images,...urls]}));}catch{setError('图片读取失败，请重新添加。');}finally{setLoading(false);}
 }
 return <form className="post-composer x-composer" onSubmit={event=>{
  event.preventDefault();if(!canPost||submitted.current)return;
  const text=body.trim(),title=text.split('\n')[0].slice(0,60)||'分享图片';
  submitted.current=true;
  try{sessionStorage.removeItem(draftKey.current);}catch{/* Submission remains available. */}
  onSubmit(title,text,category,noticeType,images,withPoll?{question:text,options:choices.map(label=>({label,votes:0}))}:undefined,category==='voice'?identity.name:undefined,category==='voice'?{...identity}:undefined);
 }}>

  <div className="x-compose-author">{category==='voice'?<AnonymousAvatar identity={identity}/>:<span className="identity-avatar public-avatar"><img src={publicAvatar} alt=""/></span>}<div><strong>{category==='voice'?identity.name:publicName}</strong><span>{category==='voice'?'匿名分身':isActivity?'发布到活动岛':'发布到创智圈'}</span></div>{category==='voice'&&<button type="button" className="x-identity-switch" onClick={()=>setIdentityOpen(!identityOpen)} aria-expanded={identityOpen}>编辑分身⌄</button>}</div>
  {category==='voice'&&identityOpen&&<AnonymousIdentityPicker identity={identity} onSave={save} onClose={()=>setIdentityOpen(false)}/>}
  {identityError&&<p role="status">匿名身份仅在本次打开期间保留。</p>}
  <textarea className="x-writing" aria-label="动态内容" autoFocus rows={4} maxLength={1500} value={body} onChange={event=>update({body:event.target.value})} placeholder={withPoll?'添加投票问题…':'分享新鲜事…'}/>
  {images.length>0&&<div className={'x-media-preview media-count-'+images.length}>{images.map((src,index)=><div key={src}><img src={src} alt={'待发布图片 '+(index+1)}/><button type="button" aria-label={'移除图片 '+(index+1)} onClick={()=>update({images:images.filter((_,i)=>i!==index)})}>×</button></div>)}</div>}
  {withPoll&&<section className="x-poll-editor" aria-label="投票选项"><header><span>投票</span><button type="button" onClick={()=>update({withPoll:false})}>移除投票</button></header>{options.map((value,index)=><div key={index}><input maxLength={80} aria-label={'投票选项 '+(index+1)} placeholder={'选项 '+(index+1)} value={value} onChange={event=>update({options:options.map((v,i)=>i===index?event.target.value:v)})}/>{options.length>2&&<button type="button" aria-label={'删除选项 '+(index+1)} onClick={()=>update({options:options.filter((_,i)=>i!==index)})}>×</button>}</div>)}{options.length<6&&<button type="button" className="x-add-choice" onClick={()=>update({options:[...options,'']})}>＋ 添加选项</button>}{new Set(choices.filter(Boolean)).size!==choices.filter(Boolean).length&&<small role="alert">请使用不同的选项。</small>}</section>}
  {!isActivity&&<div className="x-compose-options"><label className="x-anonymous-toggle"><input type="checkbox" checked={category==='voice'} onChange={event=>{update({category:event.target.checked?'voice':'notice'});setIdentityOpen(false);}}/><span>匿名发布</span></label></div>}

  <div className="x-compose-toolbar"><div className="x-attachments"><button type="button" aria-label="添加图片" title="添加图片" disabled={loading||images.length>=3} onClick={()=>fileInput.current?.click()}><span aria-hidden="true">▧</span>图片</button><button type="button" aria-label="添加投票" aria-pressed={withPoll} onClick={()=>update({withPoll:!withPoll})}><span aria-hidden="true">▥</span>投票</button></div><input ref={fileInput} className="x-file-input" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={attach} tabIndex={-1}/><span className={'x-char-count '+(body.length>1400?'near-limit':'')}>{body.length}<small>/1500</small></span><button className="x-post-button" type="submit" disabled={!canPost}>{loading?'读取图片…':category==='voice'?'匿名发布':'发布'}</button></div>
  {error&&<p className="x-compose-error" role="alert">{error}</p>}

 </form>;
}
