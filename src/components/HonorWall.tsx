import { useState } from 'react';
import type { HonorEvent, HonorProgress } from '../hooks/useHonors';
const honors: {id:string;event:HonorEvent;goal:number;symbol:string;name:string;description:string}[] = [
 {id:'welcome',event:'arrival',goal:1,symbol:'✦',name:'小镇新居民',description:'第一次来到创智小镇'},
 {id:'island',event:'island',goal:1,symbol:'⚑',name:'沿桥而行',description:'走上活动岛并进入一次'},
 {id:'reader',event:'read',goal:3,symbol:'▤',name:'认真读过',description:'打开 3 篇不同帖子的全文'},
 {id:'author',event:'publish',goal:1,symbol:'✎',name:'第一份分享',description:'发布 1 篇自己的帖子'},
 {id:'reply',event:'reply',goal:3,symbol:'❞',name:'温暖的回声',description:'在 3 篇不同帖子下回复'},
 {id:'vote',event:'vote',goal:1,symbol:'✓',name:'我的一票',description:'参与 1 次小镇投票'},
 {id:'regular',event:'read',goal:10,symbol:'✧',name:'小镇常客',description:'阅读 10 篇不同帖子的全文'},
 {id:'writer',event:'publish',goal:5,symbol:'❋',name:'故事收藏家',description:'累计发布 5 篇帖子'},
];
export function HonorWall({progress,saveError}:{progress:HonorProgress;saveError:boolean}) {
 const [filter,setFilter]=useState('all');
 const count=honors.filter(item=>progress[item.event].length>=item.goal).length;
 return <div className="honor-wall"><section className="honor-intro"><div><span>每一份参与，都值得纪念</span><h3>你在小镇留下的光</h3><p>探索、分享、回应。让平凡的小事，成为闪亮的徽章。</p></div><div className="honor-total"><b>{count}<small> / {honors.length}</small></b><span>已点亮徽章</span></div></section><nav className="honor-filters" aria-label="成就筛选">{[['all','全部徽章'],['earned','已点亮'],['locked','待解锁']].map(([id,label])=><button key={id} aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</nav><div className="honor-grid">{honors.filter(item=>filter==='all'||(filter==='earned')===(progress[item.event].length>=item.goal)).map(item=>{const value=Math.min(item.goal,progress[item.event].length),earned=value===item.goal;return <article key={item.id} className={'honor-card '+(earned?'earned':'locked')}><span className="honor-medal" aria-hidden="true">{item.symbol}</span><small>{earned?'已点亮':'待解锁'}</small><h4>{item.name}</h4><p>{item.description}</p><progress aria-label={item.name+'进度'} max={item.goal} value={value}/><span className="honor-progress">{value} / {item.goal}</span></article>;})}</div>{filter==='earned'&&count===0&&<p>来小镇逛逛，点亮第一枚徽章吧。</p>}<p className="honor-storage">{saveError?'暂时无法保存，当前进度仅在本次打开期间保留。':'成就从本功能上线后开始记录，保存在当前浏览器。匿名发言仅计入个人进度，不展示帖子内容。'}</p></div>;
}
