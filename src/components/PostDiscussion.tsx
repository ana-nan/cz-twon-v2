import { AnonymousAvatar, AnonymousIdentityPanel } from './AnonymousIdentityPicker';
import { PostPoll } from './PostPoll';
import { PostMedia } from './PostMedia';
import { useState } from 'react';
import { asset, type Post } from '../data/town';
import { Icon } from './Icon';

export function PostDiscussion({ post, onReply, onVote }: { onVote: (option: number) => void; post: Post; onReply: (text: string) => void }) {
  const [reply, setReply] = useState('');
  return <div className="post-discussion"><div className="discussion-author"><span className="discussion-identity">{post.category === 'voice' ? <AnonymousAvatar identity={post.anonymousIdentity}/> : <img src={post.customAvatar??asset(`characters/${post.avatar}.png`)} alt=""/>}</span><strong>{post.author}</strong><span>{post.time}</span></div><p className="discussion-body">{post.body}</p><PostMedia post={post} full/><PostPoll post={post} onVote={onVote}/><div className="discussion-replies"><h3>一起聊聊 <span>{post.comments.length}</span></h3>{post.comments.map(comment => <div className="comment" key={comment.id}><div className="comment-identity">{comment.anonymousIdentity?<AnonymousAvatar identity={comment.anonymousIdentity}/>:comment.avatar?<span className="identity-avatar public-avatar"><img src={comment.customAvatar??asset(`characters/${comment.avatar}.png`)} alt=""/></span>:null}<strong>{comment.author}</strong></div><p>{comment.text}</p></div>)}{!post.comments.length && <p className="quiet-text">这里还很安静，来打个招呼吧。</p>}</div>{post.category==='voice'&&<AnonymousIdentityPanel compact/>}<form className="reply-form" onSubmit={event => { event.preventDefault(); if (reply.trim()) { onReply(reply.trim()); setReply(''); } }}><input value={reply} maxLength={400} onChange={event => setReply(event.target.value)} placeholder="留下你的想法…" aria-label="回复内容" required/><button className="icon-button" disabled={!reply.trim()} aria-label="发送回复"><Icon name="send" size={18}/></button></form></div>;
}
