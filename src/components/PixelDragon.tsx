import { asset, type Outfit } from '../data/town';
export function PixelDragon({outfit='player'}:{outfit?:Outfit}){
 return <img className={'pixel-dragon character-art pixel-outfit-'+outfit} src={asset('pixel/dragon.png')} alt="" draggable={false}/>;
}
