import { asset } from '../data/town';

export function AmbientLife() {
  return <div className="napping-cat" role="img" aria-label="台阶边正在打盹的小橘猫">
    <img src={asset('ambient/sleeping-cat.png')} alt="" draggable={false}/>
  </div>;
}
