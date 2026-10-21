import { useState } from 'react';
import { asset } from '../data/town';
import { Icon } from './Icon';
const regions = [
  { id:'plaza', name:'创智龙广场', subtitle:'相遇、交流，分享今天的新鲜事', x:50, y:57, icon:'plaza', open:true, note:'心情驿站 · 匿名开麦 · 小镇公告 · 漂流瓶' },
  { id:'student', name:'学生基地', subtitle:'生活、社团，还有同频的小伙伴', x:23, y:37, icon:'homes', open:false, note:'未来，这里会是大家日常相聚的地方。' },
  { id:'research', name:'科研基地', subtitle:'好奇心出发的地方', x:76, y:36, icon:'lab', open:false, note:'课题交流、科研协作与灵感碰撞，正在筹备。' },
  { id:'career', name:'就业集市', subtitle:'让下一站，多一些可能', x:77, y:80, icon:'market', open:false, note:'实习、求职和经验分享，未来在这里见。' },
  { id:'library', name:'灵感书岛', subtitle:'读一本书，遇见另一种想法', x:23, y:81, icon:'library', open:false, note:'一座留给阅读与知识分享的小岛，正在筹备。' },
];
export function TownMap({ onEnter }: { onEnter: () => void }) {
  const [selected,setSelected] = useState('plaza');
  const region=regions.find(item=>item.id===selected)!;
  return <div className="world-atlas">
    <div className="atlas-heading"><span><i/>你在 · 创智龙广场</span><small>1 / 5 区域已开放</small></div>
    <div className="atlas-layout"><div className="atlas-chart" role="group" aria-label="创智小镇区域地图">
      <img className="atlas-drawing" src={asset('town-world-map-flat.png')} alt="创智小镇鸟瞰地图：环形广场与学生基地、科研基地、就业集市、灵感书岛由小路和桥梁相连" />
      {regions.map(item=><button key={item.id} className={`atlas-region ${item.open?'region-open':'region-locked'} ${selected===item.id?'region-selected':''}`} style={{left:`${item.x}%`,top:`${item.y}%`}} onClick={()=>setSelected(item.id)} aria-pressed={selected===item.id} aria-label={`${item.name}，${item.open?'已开放，当前位置':'暂未开放'}`}><strong>{item.name}</strong><small>{item.open?<><i/>当前位置</>:'暂未开放'}</small></button>)}
      <div className="atlas-scale"><span>● 已开放</span><span>○ 暂未开放</span><span>点击地名查看区域</span></div><span className="atlas-compass" aria-hidden="true">N<br/>↑</span>
    </div>
    <aside className="atlas-directory" aria-label="区域目录"><h3>探索小镇</h3><p>目前开放创智龙广场，其余区域正在筹备。</p>{regions.map((item,index)=><button key={item.id} className={selected===item.id?'selected':''} onClick={()=>setSelected(item.id)} aria-pressed={selected===item.id}><span className="directory-number">0{index+1}</span><span><strong>{item.name}</strong><small>{item.open?'交流 · 活动 · 匿名发言':item.id==='student'?'校园生活 · 社团交流':item.id==='research'?'课题交流 · 科研协作':item.id==='career'?'实习求职 · 经验分享':'阅读交流 · 灵感收藏'}</small></span><em>{item.open?'已开放':'暂未开放'}</em></button>)}</aside></div>
    <div className="atlas-detail" aria-live="polite"><div><span className={`atlas-status ${region.open?'open':''}`}>{region.open?'已开放':'暂未开放'}</span><h3>{region.name}</h3><p>{region.subtitle}</p><small>{region.note}</small></div><button className="atlas-enter" disabled={!region.open} onClick={onEnter}>{region.open?'回到广场':'敬请期待'}{region.open&&<Icon name="arrow" size={17}/>}</button></div>
  </div>;
}
