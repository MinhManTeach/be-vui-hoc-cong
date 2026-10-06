import type { DecorArtId } from '../../data/decor';
const star='50,8 60,34 88,35 66,52 74,80 50,64 26,80 34,52 12,35 40,34';
export function DecorArt({art,stretch=false}:{art:DecorArtId;stretch?:boolean}) {
 return <svg viewBox="0 0 100 100" preserveAspectRatio={stretch?'none':'xMidYMid meet'} aria-hidden="true" className="decor-art">
 {art==='rug'&&<><ellipse cx="50" cy="60" rx="47" ry="26" fill="#fb7185"/><ellipse cx="50" cy="60" rx="38" ry="20" fill="#fbbf24"/><ellipse cx="50" cy="60" rx="27" ry="13" fill="#38bdf8"/><ellipse cx="50" cy="60" rx="16" ry="7" fill="#c4b5fd"/></>}
 {(art==='plant'||art==='flowers')&&<><path d="M50 64V24" stroke="#15803d" strokeWidth="6"/><ellipse cx="32" cy="35" rx="19" ry="10" transform="rotate(30 32 35)" fill="#4ade80"/><ellipse cx="65" cy="46" rx="20" ry="11" transform="rotate(-30 65 46)" fill="#22c55e"/>{art==='flowers'&&<><circle cx="50" cy="22" r="17" fill="#f472b6"/><circle cx="50" cy="22" r="7" fill="#fde68a"/></>}<path d="M26 62H74L66 92H34Z" fill="#fb923c" stroke="#9a3412" strokeWidth="3"/></>}
 {art==='lamp'&&<><path d="M50 60V84" stroke="#b45309" strokeWidth="8"/><ellipse cx="50" cy="86" rx="26" ry="7" fill="#f59e0b"/><polygon points={star} fill="#fde047" stroke="#d97706" strokeWidth="3"/></>}
 {art==='picture'&&<><rect x="8" y="12" width="84" height="70" rx="8" fill="#a16207"/><rect x="16" y="20" width="68" height="54" rx="4" fill="#bae6fd"/><circle cx="65" cy="35" r="10" fill="#fde047"/><path d="M16 64L38 38L56 60L72 48L84 63V74H16Z" fill="#4ade80"/></>}
 {art==='cloud'&&<path d="M20 80C-5 74 4 38 27 43C26 9 71 10 73 42C102 31 108 78 83 80Z" fill="#fff" stroke="#93c5fd" strokeWidth="4"/>}
 {art==='toybox'&&<><rect x="11" y="36" width="78" height="51" rx="8" fill="#a78bfa" stroke="#6d28d9" strokeWidth="3"/><rect x="7" y="28" width="86" height="18" rx="5" fill="#c4b5fd"/><polygon points={star} transform="translate(27 40) scale(.45)" fill="#fde047"/></>}
 {art==='books'&&<><rect x="7" y="82" width="86" height="10" rx="4" fill="#a16207"/>{['#fb7185','#38bdf8','#a78bfa','#fbbf24'].map((color,i)=><rect key={color} x={13+i*20} y={24+(i%2)*10} width="17" height={58-(i%2)*10} rx="3" fill={color} stroke="#fff" strokeWidth="2"/>)}</>}
 {art==='moon'&&<><path d="M63 9C20 12 18 70 59 76C35 48 73 35 63 9Z" fill="#fde68a" stroke="#d97706" strokeWidth="3"/><path d="M50 76V87" stroke="#b45309" strokeWidth="6"/><ellipse cx="50" cy="90" rx="23" ry="6" fill="#fbbf24"/></>}
 {art==='trophy'&&<><path d="M22 18H78L68 57Q50 77 32 57Z" fill="#fbbf24" stroke="#b45309" strokeWidth="3"/><path d="M22 24C-4 20 6 54 31 51M78 24C104 20 94 54 69 51" fill="none" stroke="#d97706" strokeWidth="7"/><path d="M50 64V85" stroke="#b45309" strokeWidth="7"/><rect x="27" y="84" width="46" height="10" rx="4" fill="#d97706"/><text x="50" y="45" textAnchor="middle" fill="#fff" fontSize="25">10</text></>}
 </svg>;
}
