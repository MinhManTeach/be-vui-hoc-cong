import { DecorArt } from './DecorArt';
import type { Decor } from '../../data/decor';
import '../../pages/myRoom.css';
export default function DecorReveal({decor,onPlace,onLater}:{decor:Decor;onPlace:()=>void;onLater:()=>void}){
 return <div className="decor-reveal-backdrop"><section role="dialog" aria-modal="true" aria-label="Đồ trang trí mới" className="decor-reveal"><span aria-hidden="true">✦ ✧ ✦</span><h2>Con mở được {decor.displayName}!</h2><DecorArt art={decor.art}/><p>Một món đồ cho căn phòng của con.</p><button onClick={onPlace}>Đặt vào phòng</button><button onClick={onLater}>Để sau</button></section></div>;
}
