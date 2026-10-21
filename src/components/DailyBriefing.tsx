import { useEffect, useState } from 'react';
import { type Post } from '../data/town';
import { boardOf, editorialBoards, featuredIds } from '../data/editorial';
import { PostPoll } from './PostPoll';
import { PostMedia } from './PostMedia';
import { Icon } from './Icon';

const bookmarkKey = 'chuangzhi-daily-bookmarks-v1';
function readBookmarks(): string[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(bookmarkKey) ?? '[]'); return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []; } catch { return []; }
}
export function DailyBriefing({ posts, unread, onPost, onDismiss, onMarkAll, initialBoard = 'home', onCompose, onBoard, onVote }: { onVote: (id: string, option: number) => void; initialBoard?: string; onCompose: () => void; onBoard: (board: string) => void; posts: Post[]; unread: Post[]; onPost: (post: Post) => void; onDismiss: () => void; onMarkAll: () => void }) {
  const [board, updateBoard] = useState(initialBoard);
  const setBoard = (value: string) => { updateBoard(value); onBoard(value); };
  const [query, setQuery] = useState('');
  const [bookmarks, setBookmarks] = useState(readBookmarks);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { try { localStorage.setItem(bookmarkKey, JSON.stringify(bookmarks)); setStorageError(false); } catch { setStorageError(true); } }, [bookmarks]);
  const entries = posts.filter(post => post.category === 'notice' || post.category === 'voice');
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const visible = entries.filter(post => ((board === 'home' && post.category !== 'voice') || (board === 'saved' ? bookmarks.includes(post.id) : board === 'voice' ? post.category === 'voice' : boardOf(post) === board)) && words.every(word => [post.title,post.body,post.author,editorialBoards.find(item => item.id === boardOf(post))?.name].join(' ').toLocaleLowerCase().includes(word))).sort((a,b) => Number(featuredIds.includes(b.id)) - Number(featuredIds.includes(a.id)));
  const fresh = new Set(unread.map(post => post.id));
  const date = new Intl.DateTimeFormat('zh-CN', { month:'long',day:'numeric',weekday:'long',timeZone:'Asia/Shanghai' }).format(new Date());
  const toggle = (id: string) => setBookmarks(current => current.includes(id) ? current.filter(item => item !== id) : [...current,id]);
  return <div className="daily-briefing editorial-paper">
    <div className="daily-masthead"><span>THE LITTLE TOWN POST</span><span>{date}</span></div>

    <form className="editorial-search" role="search" onSubmit={event => event.preventDefault()}><Icon name="search" size={19}/><input aria-label="搜索日报内容" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索标题、内容、作者或板块…"/>{query && <button type="button" onClick={() => setQuery('')} aria-label="清空搜索">×</button>}<button type="submit">搜索</button></form>
    <div className="editorial-topics"><span>发现：</span>{['活动','文献','小作品'].map(term => <button key={term} onClick={() => {setBoard('home');setQuery(term);}}>{term}</button>)}<small>内容来自小镇公告</small></div>
    <div className="daily-entry-tabs"><button aria-pressed={board==='voice'} onClick={()=>setBoard('voice')}>匿名开麦<span>放心表达，温柔回应</span></button><button aria-pressed={board!=='voice'} onClick={()=>setBoard('home')}>小镇精选<span>发现分享、资讯与经验</span></button><button className="daily-publish" onClick={onCompose}>＋ 发布内容</button></div><div className="editorial-layout"><nav className="editorial-nav" aria-label="日报板块"><button aria-pressed={board==='home'} onClick={()=>setBoard('home')}><span>⌂</span>首页推荐</button><button aria-pressed={board==='saved'} onClick={()=>setBoard('saved')}><span>☆</span>我的收藏 <small>{entries.filter(post=>bookmarks.includes(post.id)).length}</small></button><p>全部板块</p>{editorialBoards.map(item=><button key={item.id} aria-pressed={board===item.id} onClick={()=>setBoard(item.id)}><span>{item.symbol}</span>{item.name}</button>)}<small className="bookmark-note">收藏保存在当前浏览器</small></nav>
    <section className="editorial-feed" aria-label="推荐内容"><header className="editorial-feed-heading"><h3>{board==='home'?'今日推荐':board==='saved'?'我的收藏':editorialBoards.find(item=>item.id===board)?.name}</h3><span role="status">{visible.length} 篇{query?'匹配内容':''}</span></header>
    {storageError && <p role="status">浏览器存储不可用，收藏仅在本次打开期间保留。</p>}
    {!visible.length && <div className="editorial-empty"><Icon name="book" size={28}/><h4>{query?'没有找到匹配的内容':board==='saved'?'把值得再读的内容留下来':'这个板块还在等第一份分享'}</h4><p>{query?'试试其他关键词，或切换到首页搜索全部公告。':board==='saved'?'点击内容下方的「收藏」，就能在这里再次找到。':'新的公告会出现在这里。'}</p>{query&&<button onClick={()=>{setQuery('');setBoard('home');}}>查看全部内容</button>}</div>}
    {visible.map(post=><article key={post.id} className="editorial-card"><header><span className={'editorial-avatar avatar-'+boardOf(post)}>{post.author.slice(0,1)}</span><div><strong>{post.author}</strong><button className="editorial-board-tag" onClick={()=>setBoard(boardOf(post))}>{editorialBoards.find(item=>item.id===boardOf(post))?.name} ›</button></div><time>{post.time}</time></header><button className="editorial-story" onClick={()=>onPost(post)}><h4>{fresh.has(post.id)&&<i aria-label="未读"/>}{post.title}</h4><p>{post.body}</p></button><button className="editorial-media-link" onClick={()=>onPost(post)} aria-label={'查看配图：'+post.title}><PostMedia post={post}/></button><PostPoll post={post} onVote={option=>onVote(post.id,option)}/><footer>{featuredIds.includes(post.id)&&<span className="editorial-pick">✦ 编辑精选</span>}<button onClick={()=>onPost(post)}><Icon name="chat" size={16}/>评论 {post.comments.length || ''}</button><button aria-pressed={bookmarks.includes(post.id)} aria-label={(bookmarks.includes(post.id)?'取消收藏：':'收藏：')+post.title} onClick={()=>toggle(post.id)}><span>{bookmarks.includes(post.id)?'★':'☆'}</span>{bookmarks.includes(post.id)?'已收藏':'收藏'}</button><button onClick={()=>onPost(post)}>阅读全文 ↗</button></footer></article>)}
    </section></div>
    <footer className="daily-footer"><button className="daily-mark-read" onClick={onMarkAll} disabled={!unread.length}>全部标为已读</button><button className="primary-button" onClick={onDismiss}>去广场逛逛<Icon name="arrow" size={17}/></button></footer>
  </div>;
}
