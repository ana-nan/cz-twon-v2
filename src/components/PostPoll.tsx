import { useState } from 'react';
import type { Post } from '../data/town';

export function PostPoll({post,onVote}:{post:Post;onVote:(option:number)=>void}) {
  const [choice,setChoice] = useState<number | null>(null);
  const poll=post.poll;
  if(!poll) return null;
  const voted=poll.selected!==undefined;
  const total=poll.options.reduce((sum,option)=>sum+option.votes,0);
  return <section className="post-poll" aria-label={'投票：'+poll.question}>
    <header><span>小镇投票</span><small>单选</small></header><h4>{poll.question}</h4>
    <div className="poll-options" role="group" aria-label={poll.question}>{poll.options.map((option,index)=>{const percent=total?Math.round(option.votes/total*100):0;return <button type="button" key={index} disabled={voted} aria-pressed={voted?poll.selected===index:choice===index} onClick={()=>setChoice(index)} className="poll-option">
      {voted&&<i style={{width:percent+'%'}}/>}<span>{(voted?poll.selected===index:choice===index)?'●':'○'} {option.label}</span>{voted&&<b>{percent}% <small>· {option.votes} 票</small></b>}
    </button>;})}</div>
    <footer><small aria-live="polite">{total} 票 · {voted?'已投票':'投票后查看结果'}</small>{!voted&&<button type="button" className="poll-submit" disabled={choice===null} onClick={()=>{if(choice!==null)onVote(choice);}}>确认投票</button>}</footer>
    <p className="poll-local-note">演示投票，仅保存在当前浏览器。</p>
  </section>;
}
