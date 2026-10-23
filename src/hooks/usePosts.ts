import { normalizeIdentity, readAnonymousIdentity, type AnonymousIdentity } from '../data/anonymousIdentity';
import { useEffect, useState } from 'react';
import { initialPosts, outfits, places, type Post, type PlaceId, type NoticeType, type Poll, type Outfit } from '../data/town';

const key = 'chuangzhi-town-posts-v3';
const legacyCategories: Record<string, PlaceId> = { signal: 'notice', poster: 'notice', learning: 'bottle', culture: 'bottle', voice: 'voice', heart: 'heart', ideas: 'bottle' };
function anonymize(post: Post): Post {
  return post.category === 'voice' ? { ...post, anonymousIdentity: normalizeIdentity(post.anonymousIdentity ?? {name:post.anonymousName}), author: normalizeIdentity(post.anonymousIdentity ?? {name:post.anonymousName}).name, avatar: 'player', comments: post.comments.map(comment => ({ ...comment, author: comment.anonymousIdentity ? normalizeIdentity(comment.anonymousIdentity).name : '匿名回应', anonymousIdentity:comment.anonymousIdentity?normalizeIdentity(comment.anonymousIdentity):undefined })) } : post;
}
function readPosts(): Post[] {
  try {
    const saved = localStorage.getItem(key);
    let data: unknown = JSON.parse(saved ?? localStorage.getItem('chuangzhi-town-posts-v2') ?? 'null');
    if (!saved && Array.isArray(data)) data = data.map(post => {
      if (!post || typeof post !== 'object') return post;
      const seed = initialPosts.find(item => item.id === post.id);
      return seed ? { ...seed, comments: post.comments, replies: post.comments?.length ?? 0 } : { ...post, category: legacyCategories[post.category] ?? post.category, noticeType: post.category === 'signal' ? 'signal' : 'poster' };
    });
    if (Array.isArray(data) && data.length && data.every(post => post && typeof post.id === 'string' && typeof post.title === 'string' && typeof post.body === 'string' && typeof post.author === 'string' && typeof post.time === 'string' && typeof post.replies === 'number' && places.some(place => place.id === post.category) && (outfits.some(outfit=>outfit.id===post.avatar)||post.avatar==='campus') && Array.isArray(post.comments) && post.comments.every((comment: { id?: unknown; text?: unknown; author?: unknown }) => comment && typeof comment.id === 'string' && typeof comment.text === 'string' && typeof comment.author === 'string'))) return data.map(anonymize);
  } catch { /* A fresh local demo also works when storage is unavailable. */ }
  return structuredClone(initialPosts).map(anonymize);
}
export function usePosts(profile: {name:string;avatar:Outfit;customAvatar?:string} = {name:'我',avatar:'player'}) {
  const [storageError, setStorageError] = useState(false);
  const [posts, setPosts] = useState<Post[]>(readPosts);
  useEffect(() => { setPosts(current => { const missing = initialPosts.filter(seed => !current.some(post => post.id === seed.id)); return missing.length ? [...missing.map(anonymize), ...current] : current; }); }, []);
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(posts)); setStorageError(false); } catch { setStorageError(true); } }, [posts]);
  const createPost = (title: string, body: string, category: PlaceId, noticeType?: NoticeType, images?: string[], poll?: Poll, anonymousName?: string, anonymousIdentity?: AnonymousIdentity) => {
    const post: Post = anonymize({ id: crypto.randomUUID(), title, body, category, images, poll, anonymousIdentity:category==='voice'?normalizeIdentity(anonymousIdentity??{name:anonymousName}):undefined, anonymousName: category === 'voice' ? anonymousName?.trim().slice(0,20) : undefined, noticeType: category === 'notice' ? noticeType ?? 'poster' : undefined, author: profile.name, avatar: category==='voice'?'player':profile.avatar, customAvatar:category==='voice'?undefined:profile.customAvatar, time: '刚刚', replies: 0, comments: [] });
    setPosts(current => [post, ...current]);
  };
  const replyToPost = (id: string, text: string) => setPosts(current => current.map(post => post.id === id ? { ...post, replies: post.replies + 1, comments: [...post.comments, { id: crypto.randomUUID(), text, author: post.category === 'voice' ? readAnonymousIdentity().name : profile.name, avatar:post.category==='voice'?undefined:profile.avatar, customAvatar:post.category==='voice'?undefined:profile.customAvatar, anonymousIdentity:post.category==='voice'?readAnonymousIdentity():undefined }] } : post));
  const voteOnPost = (id: string, option: number) => setPosts(current => current.map(post => {
    if (post.id !== id || !post.poll || post.poll.selected !== undefined || !Number.isInteger(option) || !post.poll.options[option]) return post;
    return {...post, poll: {...post.poll, selected: option, options: post.poll.options.map((item,index) => ({...item,votes:item.votes+(index===option?1:0)}))}};
  }));
  return { posts, createPost, replyToPost, voteOnPost, storageError };
}
