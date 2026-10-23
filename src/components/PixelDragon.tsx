import { characterArt } from '../data/characterArt';
import { type Outfit } from '../data/town';
export function PixelDragon({outfit='player'}:{outfit?:Outfit}){
 return <img className={'pixel-dragon character-art pixel-outfit-'+outfit} src={characterArt(outfit,'pixel')} alt="" draggable={false}/>;
}
