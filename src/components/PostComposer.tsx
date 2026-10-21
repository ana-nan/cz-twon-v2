import { useState } from 'react';
import { places, getPlace, type PlaceId, type NoticeType, type Poll } from '../data/town';
import { Icon } from './Icon';

export function PostComposer({ initialCategory = 'bottle', onSubmit }: { initialCategory?: PlaceId; onSubmit: (title: string, body: string, category: PlaceId, noticeType?: NoticeType, images?: string[], poll?: Poll, anonymousName?: string) => void }) {
  const [anonymousName, setAnonymousName] = useState(() => { try {return localStorage.getItem('town-anonymous-name') ?? '';} catch {return '';} });
  const [withPoll, setWithPoll] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['','']);
  const validPoll = !withPoll || (question.trim() && options.every(value=>value.trim()) && new Set(options.map(value=>value.trim())).size === options.length);
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState('');
  const [loadingImages, setLoadingImages] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [noticeType, setNoticeType] = useState<NoticeType>('poster');
  return <form className="post-composer" onSubmit={event => { event.preventDefault(); if (title.trim() && body.trim() && validPoll) onSubmit(title.trim(), body.trim(), category, noticeType, images, withPoll ? {question:question.trim(), options:options.map(label=>({label:label.trim(),votes:0}))} : undefined, anonymousName); }}>
    <label>分享到哪里<select value={category} onChange={event => setCategory(event.target.value as PlaceId)}>{places.filter(place => place.id !== 'bottle').map(place => <option key={place.id} value={place.id}>{place.name}</option>)}</select></label>
    {category === 'voice' && <p className="anonymous-note"><Icon name="chat" size={20}/>这条帖子使用独立的匿名昵称，不展示你的小镇昵称与装扮。</p>}
    {category === 'voice' && <label>匿名昵称（可选）<input maxLength={20} value={anonymousName} placeholder="留空则显示「匿名小龙」" onChange={event=>{setAnonymousName(event.target.value);try{localStorage.setItem('town-anonymous-name',event.target.value);}catch{/* Keep session usable. */}}}/><small>用于本次发布，也会记住供下次使用；修改不会影响旧帖。</small></label>}
    {category === 'notice' && <label>公告类型<select value={noticeType} onChange={event => setNoticeType(event.target.value as NoticeType)}><option value="poster">活动海报 / 招募</option><option value="signal">前沿信号 / 资讯</option></select></label>}
    <label>想分享什么？<input value={title} onChange={event => setTitle(event.target.value)} maxLength={60} placeholder="给这个小故事起个标题" required autoFocus/></label>
    <label>展开说说<textarea value={body} onChange={event => setBody(event.target.value)} maxLength={1500} rows={5} placeholder="一个发现、一份邀请，或者今天的好心情…" required/></label>
    <label>配图（最多 3 张，每张不超过 800 KB）<input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={loadingImages} onChange={async event => {
      const files = Array.from(event.target.files ?? []); event.target.value = '';
      if(files.length + images.length > 3){setImageError('最多上传 3 张图片，请先移除不需要的图片。');return;}
      if(files.some(file=>file.size>800*1024 || !['image/png','image/jpeg','image/webp'].includes(file.type))){setImageError('请选择 800 KB 以内的 PNG、JPG 或 WebP 图片。');return;}
      setLoadingImages(true);setImageError('');
      try { const urls = await Promise.all(files.map(file=>new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file);}))); setImages(current=>[...current,...urls]); } catch {setImageError('图片读取失败，请重试。');} finally {setLoadingImages(false);}
    }}/></label>
    {imageError&&<p role="alert">{imageError}</p>}
    <div className="composer-images">{images.map((src,i)=><div key={i}><img src={src} alt={'待发布配图 '+(i+1)}/><button type="button" aria-label={'删除配图 '+(i+1)} onClick={()=>setImages(current=>current.filter((_,index)=>index!==i))}>×</button></div>)}</div>
    <section className="poll-composer"><label className="poll-toggle"><input type="checkbox" checked={withPoll} onChange={event=>setWithPoll(event.target.checked)}/>附加投票</label>{withPoll&&<><label>投票问题<input required maxLength={100} value={question} onChange={event=>setQuestion(event.target.value)} placeholder="想听听大家对什么的看法？"/></label>{options.map((option,index)=><div className="poll-option-editor" key={index}><input aria-label={'选项 '+(index+1)} required maxLength={80} value={option} placeholder={'选项 '+(index+1)} onChange={event=>setOptions(current=>current.map((value,i)=>i===index?event.target.value:value))}/>{options.length>2&&<button type="button" aria-label={'删除选项 '+(index+1)} onClick={()=>setOptions(current=>current.filter((_,i)=>i!==index))}>×</button>}</div>)}{options.length<6&&<button type="button" className="poll-add" onClick={()=>setOptions(current=>[...current,''])}>＋ 添加选项</button>}<small>单选 · 2–6 个不同选项 · 发布后可在帖子中投票</small></>}</section>
    <button className="primary-button"  disabled={!validPoll || loadingImages || !title.trim() || !body.trim()}><Icon name="plus" size={18}/>{getPlace(category).action}</button>
  </form>;
}
