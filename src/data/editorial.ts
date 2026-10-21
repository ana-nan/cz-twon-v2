import type { Post } from './town';
export const editorialBoards = [
  { id:'signal', name:'前沿信号', symbol:'✦' },
  { id:'poster', name:'创智海报栏', symbol:'▧' },
  { id:'learning', name:'学习交流', symbol:'▤' },
  { id:'culture', name:'文化生活', symbol:'☕' },
  { id:'voice', name:'匿名开麦', symbol:'♬' },
  { id:'heart', name:'活动岛', symbol:'♡' },
  { id:'ideas', name:'智汇先锋', symbol:'✧' },
] as const;
export type EditorialBoard = typeof editorialBoards[number]['id'];
export const boardOf = (post: Post): EditorialBoard => post.category === 'voice' ? 'voice' : post.editorialBoard ?? (post.noticeType === 'signal' ? 'signal' : 'poster');
export const featuredIds = ['daily-culture','daily-learning','post-4','daily-ideas'];
