import { type Post } from '../data/town';
export function PostMedia({post, full=false}:{post:Post;full?:boolean}) {
  const images = post.images ?? [];
  if (!images.length) return null;
  return <figure className={'post-media '+(full?'full ':'')+(images.length>1?'multiple':'single')}>{images.map((src,i)=><img key={i} src={src} alt={post.title+' · 配图 '+(i+1)} loading="lazy"/>)}</figure>;
}
