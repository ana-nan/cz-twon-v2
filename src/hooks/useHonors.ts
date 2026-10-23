import { honors } from '../data/honors';
import { useCallback, useEffect, useRef, useState } from 'react';
export type HonorEvent = 'arrival' | 'island' | 'read' | 'publish' | 'reply' | 'vote';
export type HonorProgress = Record<HonorEvent, string[]>;
const empty: HonorProgress = {arrival:[],island:[],read:[],publish:[],reply:[],vote:[]};
export function useHonors() {
  const [progress,setProgress] = useState<HonorProgress>(()=>{
    try {const saved=JSON.parse(localStorage.getItem('town-honors-v1')??'{}');return Object.fromEntries(Object.entries(empty).map(([key,value])=>[key,Array.isArray(saved[key])?saved[key].filter((id:unknown)=>typeof id==='string'):value])) as HonorProgress;} catch {return empty;}
  });
  const seen = useRef(new Set(honors.filter(honor=>progress[honor.event].length>=honor.goal).map(honor=>honor.id)));
  const [celebrations,setCelebrations] = useState<string[]>([]);
  const dismissCelebration = useCallback(()=>setCelebrations(current=>current.slice(1)),[]);
  useEffect(()=>{
    const unlocked=honors.filter(honor=>progress[honor.event].length>=honor.goal&&!seen.current.has(honor.id));
    if(!unlocked.length)return;
    unlocked.forEach(honor=>seen.current.add(honor.id));
    setCelebrations(current=>[...current,...unlocked.map(honor=>honor.id)]);
  },[progress]);
  const [saveError,setSaveError] = useState(false);
  const record=(event:HonorEvent,id='once')=>setProgress(current=>current[event].includes(id)?current:{...current,[event]:[...current[event],id]});
  useEffect(()=>{record('arrival');},[]);
  useEffect(()=>{try{localStorage.setItem('town-honors-v1',JSON.stringify(progress));setSaveError(false);}catch{setSaveError(true);}},[progress]);
  return {progress,record,saveError,celebration:honors.find(honor=>honor.id===celebrations[0]),dismissCelebration};
}
