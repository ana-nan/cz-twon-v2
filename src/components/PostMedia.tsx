import { asset, type Post } from '../data/town';
const illustration: Record<string,string[]> = {
  'daily-culture':['plaza-island-clean-day.png'],
  'daily-learning':['town-world-map-flat.png'],
  'daily-ideas':['characters/campus.png'],
  'daily-heart':['plaza-island-clean-day.png'],
  'daily-voice':['plaza-island-clean-night.png'],
  'post-4':['characters/jojo.png'],
  'post-2':['seasonal/birthday-912-rich.png'],
  'town-life-03':['town-world-map-flat.png'],
  'town-life-07':['characters/campus.png'],
};
export function PostMedia({post, full=false}:{post:Post;full?:boolean}) {
  const images = post.images?.length ? post.images : (illustration[post.id] ?? []).map(asset);
  if (!images.length) return null;
  return <figure className={'post-media '+(full?'full ':'')+(images.length>1?'multiple':'single')}>{images.map((src,i)=><img key={i} src={src} alt={post.title+' · 配图 '+(i+1)} loading="lazy"/>)}{!post.images?.length&&<figcaption>小镇插画 · 示意配图</figcaption>}</figure>;
}
