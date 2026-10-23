import { asset } from '../data/town';
export function PixelWorld({birthday=false,night=false}:{birthday?:boolean;night?:boolean}){
 return <div className="pixel-world" aria-label="像素小镇：湖面、活动岛与创智圈">
  <img className="pixel-background" src={asset('pixel/plaza-day.png')} alt="没有固定角色的像素广场日景" draggable={false}/>
  <img className="pixel-background pixel-night" style={{opacity:night?1:0}} src={asset('pixel/plaza-night.png')} aria-hidden={!night} alt="月光与暖灯下的像素广场夜景" draggable={false}/>
  <div className="pixel-sparkles" aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i} style={{left:470+(i*79)%900,top:145+(i*31)%145,animationDelay:`${i*.43}s`}}/>)}</div>
  {night&&<div className="pixel-stars" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{left:400+(i*97)%1000,top:20+(i*23)%95,animationDelay:`${i*.7}s`}}/>)}</div>}
  {birthday&&<div className="pixel-birthday" role="img" aria-label="9·12 像素生日桌"><img src={asset('pixel/birthday.png')} alt="" draggable={false}/></div>}

 </div>;
}
