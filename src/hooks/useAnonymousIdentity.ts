import { useEffect, useState } from 'react';
import { readAnonymousIdentity, normalizeIdentity, type AnonymousIdentity } from '../data/anonymousIdentity';
const eventName='town-anonymous-identity-changed';
export function useAnonymousIdentity() {
  const [identity,setIdentity]=useState(readAnonymousIdentity);
  const [error,setError]=useState(false);
  useEffect(()=>{
    const local=(event:Event)=>setIdentity(normalizeIdentity((event as CustomEvent).detail));
    const external=(event:StorageEvent)=>{if(event.key==='town-anonymous-identity-v1')setIdentity(readAnonymousIdentity());};
    window.addEventListener(eventName,local);window.addEventListener('storage',external);
    return ()=>{window.removeEventListener(eventName,local);window.removeEventListener('storage',external);};
  },[]);
  function save(value:AnonymousIdentity){const next=normalizeIdentity(value);setIdentity(next);try{localStorage.setItem('town-anonymous-identity-v1',JSON.stringify(next));setError(false);}catch{setError(true);}window.dispatchEvent(new CustomEvent(eventName,{detail:next}));}
  return {identity,save,error};
}
