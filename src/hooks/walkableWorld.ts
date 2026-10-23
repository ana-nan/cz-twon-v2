import type { Point } from '../data/town';
const ellipses = [
 {x:800,y:690,rx:475,ry:175},
 {x:243,y:335,rx:123,ry:26},
 {x:179,y:686,rx:100,ry:25},
];
const corridors: [Point,Point,number][] = [
 [{x:275,y:339},{x:487,y:427},23],
 [{x:487,y:427},{x:620,y:548},39],
 [{x:528,y:445},{x:1165,y:445},25],
 [{x:1165,y:445},{x:1400,y:488},32],
 [{x:1400,y:488},{x:1404,y:670},33],
 [{x:1404,y:670},{x:1190,y:750},33],
 [{x:179,y:686},{x:415,y:725},32],
 [{x:1165,y:445},{x:1100,y:570},35],
 [{x:800,y:810},{x:800,y:887},64],
];
function onSegment(p:Point,a:Point,b:Point): Point {
 const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));
 return {x:a.x+t*dx,y:a.y+t*dy};
}
export function isWalkable(p:Point) {
 return ellipses.some(e=>((p.x-e.x)/e.rx)**2+((p.y-e.y)/e.ry)**2<=1) || corridors.some(([a,b,r])=>{const q=onSegment(p,a,b);return Math.hypot(p.x-q.x,p.y-q.y)<=r;});
}
export function nearestWalkable(p:Point):Point {
 if(isWalkable(p))return p;
 const candidates = ellipses.map(e=>{const dx=(p.x-e.x)/e.rx,dy=(p.y-e.y)/e.ry,n=Math.hypot(dx,dy);return {x:e.x+dx/n*e.rx*.99,y:e.y+dy/n*e.ry*.99};});
 corridors.forEach(([a,b,r])=>{const q=onSegment(p,a,b),d=Math.hypot(p.x-q.x,p.y-q.y);candidates.push({x:q.x+(p.x-q.x)/d*r*.98,y:q.y+(p.y-q.y)/d*r*.98});});
 return candidates.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
}
function clearLine(a:Point,b:Point) {
 const count=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8);
 for(let i=0;i<=count;i++)if(!isWalkable({x:a.x+(b.x-a.x)*i/Math.max(1,count),y:a.y+(b.y-a.y)*i/Math.max(1,count)}))return false;
 return true;
}
export function walkingRoute(start:Point, requested:Point):Point[] {
 const end=nearestWalkable(requested);
 const nodes=[start,end,...corridors.flatMap(([a,b])=>[a,b]),...ellipses.map(e=>({x:e.x,y:e.y}))];
 const costs=nodes.map(()=>Infinity),prev=nodes.map(()=>-1),done=new Set<number>();costs[0]=0;
 while(done.size<nodes.length) {
  let u=-1;nodes.forEach((_,i)=>{if(!done.has(i)&&(u<0||costs[i]<costs[u]))u=i;});
  if(u<0||!Number.isFinite(costs[u]))break;
  if(u===1){const path:Point[]=[];for(let v=1;v!==0;v=prev[v])path.unshift(nodes[v]);return path;}
  done.add(u);
  nodes.forEach((v,i)=>{if(done.has(i)||!clearLine(nodes[u],v))return;const next=costs[u]+Math.hypot(v.x-nodes[u].x,v.y-nodes[u].y);if(next<costs[i]){costs[i]=next;prev[i]=u;}});
 }
 return [];
}
