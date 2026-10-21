import { PostMedia } from './PostMedia';
import { asset, getPlace, type Post } from '../data/town';
import { Icon } from './Icon';

export function PostCard({ post, onClick, expanded = false }: { post: Post; onClick: () => void; expanded?: boolean }) {
  const place = getPlace(post.category);
  return <button className={`post-card ${expanded ? 'expanded' : ''}`} onClick={onClick}>
    <span className="post-category"><i style={{ background: place.color }}/>{place.name}<span>{post.time}</span></span>
    <strong>{post.title}</strong>
    {expanded && <p>{post.body}</p>}
    <PostMedia post={post}/><span className="post-footer"><span className="post-author">{post.category === 'voice' ? <><span className="anonymous-avatar"><Icon name="chat" size={14}/></span>匿名小龙</> : <><img src={asset(`characters/${post.avatar}.png`)} alt=""/>{post.author}</>}</span><span className="reply-count"><Icon name="chat" size={13}/>{post.replies}</span></span>
  </button>;
}
