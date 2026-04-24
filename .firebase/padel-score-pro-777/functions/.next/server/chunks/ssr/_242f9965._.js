module.exports=[745209,501199,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(346271),e=a.i(262036),f=a.i(170106);let g=(0,f.default)("menu",[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]]);var h=a.i(633508),i=a.i(583077),j=a.i(660246),k=a.i(321161),l=a.i(220005),m=a.i(681010),n=a.i(759165),o=a.i(861545),p=a.i(790166),q=a.i(232642),r=a.i(753250),s=a.i(371727),t=a.i(546842),u=a.i(856738);let v=(0,f.default)("receipt",[["path",{d:"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z",key:"q3az6g"}],["path",{d:"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8",key:"1h4pet"}],["path",{d:"M12 17.5v-11",key:"1jc1ny"}]]);a.s(["Receipt",()=>v],501199);var w=a.i(238246),x=a.i(338393),y=a.i(515358),z=a.i(50944),A=a.i(747588),B=a.i(942687),C=a.i(357374);function D({menuOpensUserHub:a=!1}){let[f,v]=(0,c.useState)(!1),{logout:D,isAdmin:E,markerCanchas:F,user:G}=(0,x.useAuth)(),{appTitle:H,clubName:I}=(0,y.useAppSettings)(),J=(0,z.useRouter)();(0,z.usePathname)();let K=async()=>{if(v(!1),!G?.uid)return void J.push("/login");try{let a=await B.dataService.getMyParticipants(G.uid),b=a?.[0];b?.id?J.push("/mi-cuenta"):J.push("/players/register")}catch(a){console.error("Sidebar: error cargando ficha de jugador",(a instanceof Error?a.message:String(a))||a),J.push("/mi-cuenta")}},L=[{name:"Perfil",onClick:K,icon:t.User,color:"text-purple-400",bg:"bg-purple-400/10"},{name:"Torneos",href:"/tournaments",icon:i.Trophy,color:"text-padel-primary",bg:"bg-padel-primary/10"},{name:"Ranking",href:"/ranking",icon:r.Medal,color:"text-blue-400",bg:"bg-blue-400/10"},{name:"Wallet",onClick:()=>{},icon:u.Wallet,color:"text-emerald-400",bg:"bg-emerald-400/10",disabled:!0}];return p.DollarSign,o.Brain,j.Users,n.Megaphone,[m.Home,...E?[{name:"Live",href:"/live",icon:s.Radio}]:[],...F?.length>0?F.map(a=>({name:`Marcador ${(0,A.getCanchaLabel)(a)}`,href:`/marker/${a}`,icon:q.Crosshair})):[]],(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("button",{type:"button",onClick:()=>{a?K():v(!0)},"aria-label":a?"Ir a mi cuenta y perfil":"Abrir menú de navegación",className:"fixed top-6 left-6 z-[100] w-12 h-12 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-all text-white shadow-2xl",children:a?(0,b.jsx)(t.User,{className:"w-5 h-5 text-padel-primary"}):(0,b.jsx)(g,{className:"w-5 h-5 text-padel-primary"})}),(0,b.jsx)(e.AnimatePresence,{children:f&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(d.motion.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:()=>v(!1),className:"fixed inset-0 bg-black/80 backdrop-blur-md z-[110]"}),(0,b.jsxs)(d.motion.div,{initial:{x:"-100%"},animate:{x:0},exit:{x:"-100%"},transition:{type:"spring",damping:30,stiffness:300},className:"fixed top-0 left-0 bottom-0 w-full sm:w-[350px] bg-[#080808] border-r border-white/5 z-[120] flex flex-col overflow-hidden",children:[(0,b.jsx)("div",{className:"absolute top-0 right-0 w-64 h-64 bg-padel-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none"}),(0,b.jsxs)("div",{className:"p-8 pb-4 flex justify-between items-start relative z-10",children:[(0,b.jsxs)("div",{className:"flex flex-col gap-1",children:[(0,b.jsxs)("div",{className:"flex items-center gap-3",children:[(0,b.jsx)(C.default,{size:24,bounceHeight:1.5}),(0,b.jsxs)("h2",{className:"text-2xl font-black italic uppercase tracking-tighter text-white",children:["SMART ",(0,b.jsx)("span",{className:"text-padel-primary",children:"PADEL"})]})]}),I&&(0,b.jsx)("p",{className:"text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-9",children:I})]}),(0,b.jsx)("button",{onClick:()=>v(!1),className:"w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all",children:(0,b.jsx)(h.X,{className:"w-4 h-4"})})]}),(0,b.jsx)("div",{className:"px-8 mb-6 space-y-2 relative z-10",children:L.map(a=>(0,b.jsxs)("button",{disabled:a.disabled,onClick:()=>{a.onClick?a.onClick():a.href&&(v(!1),J.push(a.href))},className:`w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-tight transition-all border ${a.disabled?"bg-zinc-900/40 border-white/5 opacity-40 grayscale cursor-not-allowed":"bg-zinc-900/60 border-white/5 hover:border-padel-primary/30 hover:bg-zinc-800"}`,children:[(0,b.jsx)("div",{className:`p-2 rounded-xl ${a.bg} ${a.color}`,children:(0,b.jsx)(a.icon,{className:"w-4 h-4"})}),(0,b.jsx)("span",{className:"text-zinc-300 italic",children:a.name})]},a.name))}),(0,b.jsx)("div",{className:"px-8 flex-1 pb-8 relative z-10"}),(0,b.jsxs)("div",{className:"p-8 border-t border-white/5 bg-black/40 backdrop-blur-3xl space-y-4 relative z-10",children:[E&&(0,b.jsxs)(w.default,{href:"/admin/settings",onClick:()=>v(!1),className:"w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all group",children:[(0,b.jsx)(k.Settings,{className:"w-4 h-4"}),(0,b.jsx)("span",{className:"text-xs font-black uppercase italic tracking-tight",children:"Ajustes del Sistema"})]}),(0,b.jsxs)("button",{onClick:async()=>{await D(),v(!1),J.replace("/login")},className:"w-full flex items-center gap-3 py-3 px-4 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all group border border-red-500/10",children:[(0,b.jsx)(l.LogOut,{className:"w-4 h-4"}),(0,b.jsx)("span",{className:"text-xs font-black uppercase italic tracking-tight",children:"Finalizar Sesión"})]}),(0,b.jsx)("div",{className:"pt-2 text-center",children:(0,b.jsx)("p",{className:"text-[8px] font-black text-zinc-700 uppercase tracking-[0.5em] italic",children:"Smart Padel v3.0 Pro"})})]})]})]})})]})}a.s(["default",()=>D],745209)},759165,a=>{"use strict";let b=(0,a.i(170106).default)("megaphone",[["path",{d:"M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",key:"q8bfy3"}],["path",{d:"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14",key:"1853fq"}],["path",{d:"M8 6v8",key:"15ugcq"}]]);a.s(["Megaphone",()=>b],759165)},747588,a=>{"use strict";function b(a){let b=a.replace("cancha_","");return`Pista ${b}`}a.s(["getCanchaLabel",()=>b])},371727,a=>{"use strict";let b=(0,a.i(170106).default)("radio",[["path",{d:"M16.247 7.761a6 6 0 0 1 0 8.478",key:"1fwjs5"}],["path",{d:"M19.075 4.933a10 10 0 0 1 0 14.134",key:"ehdyv1"}],["path",{d:"M4.925 19.067a10 10 0 0 1 0-14.134",key:"1q22gi"}],["path",{d:"M7.753 16.239a6 6 0 0 1 0-8.478",key:"r2q7qm"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);a.s(["Radio",()=>b],371727)},861545,a=>{"use strict";let b=(0,a.i(170106).default)("brain",[["path",{d:"M12 18V5",key:"adv99a"}],["path",{d:"M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4",key:"1e3is1"}],["path",{d:"M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5",key:"1gqd8o"}],["path",{d:"M17.997 5.125a4 4 0 0 1 2.526 5.77",key:"iwvgf7"}],["path",{d:"M18 18a4 4 0 0 0 2-7.464",key:"efp6ie"}],["path",{d:"M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517",key:"1gq6am"}],["path",{d:"M6 18a4 4 0 0 1-2-7.464",key:"k1g0md"}],["path",{d:"M6.003 5.125a4 4 0 0 0-2.526 5.77",key:"q97ue3"}]]);a.s(["Brain",()=>b],861545)},753250,a=>{"use strict";let b=(0,a.i(170106).default)("medal",[["path",{d:"M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15",key:"143lza"}],["path",{d:"M11 12 5.12 2.2",key:"qhuxz6"}],["path",{d:"m13 12 5.88-9.8",key:"hbye0f"}],["path",{d:"M8 7h8",key:"i86dvs"}],["circle",{cx:"12",cy:"17",r:"5",key:"qbz8iq"}],["path",{d:"M12 18v-2h-.5",key:"fawc4q"}]]);a.s(["Medal",()=>b],753250)},681010,a=>{"use strict";let b=(0,a.i(170106).default)("house",[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]]);a.s(["Home",()=>b],681010)},321161,a=>{"use strict";let b=(0,a.i(170106).default)("settings",[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);a.s(["Settings",()=>b],321161)},583077,a=>{"use strict";let b=(0,a.i(170106).default)("trophy",[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",key:"1n3hpd"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",key:"rfe1zi"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18",key:"7xy6bh"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6",key:"tex48p"}]]);a.s(["Trophy",()=>b],583077)},660246,a=>{"use strict";let b=(0,a.i(170106).default)("users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]]);a.s(["Users",()=>b],660246)},790166,a=>{"use strict";let b=(0,a.i(170106).default)("dollar-sign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);a.s(["DollarSign",()=>b],790166)},856738,a=>{"use strict";let b=(0,a.i(170106).default)("wallet",[["path",{d:"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",key:"18etb6"}],["path",{d:"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",key:"xoc0q4"}]]);a.s(["Wallet",()=>b],856738)},232642,a=>{"use strict";let b=(0,a.i(170106).default)("crosshair",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"22",x2:"18",y1:"12",y2:"12",key:"l9bcsi"}],["line",{x1:"6",x2:"2",y1:"12",y2:"12",key:"13hhkx"}],["line",{x1:"12",x2:"12",y1:"6",y2:"2",key:"10w3f3"}],["line",{x1:"12",x2:"12",y1:"22",y2:"18",key:"15g9kq"}]]);a.s(["Crosshair",()=>b],232642)},357374,a=>{"use strict";var b=a.i(187924);function c({size:a=36,duration:c=700,bounceHeight:d=2.2,className:e=""}){let f=a*d,g=`bb-${a}-${c}`;return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("style",{children:`
                /* ── Contenedor vertical — ocupa la altura del viaje + pelota + sombra ── */
                .${g}-wrap {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    height: ${f+a+.28*a}px;
                    width: ${1.2*a}px;
                    position: relative;
                    flex-shrink: 0;
                    margin-bottom: 2px;
                }

                /* ── PELOTA ── */
                .${g}-ball {
                    width: ${a}px;
                    height: ${a}px;
                    border-radius: 50%;
                    background: radial-gradient(
                        circle at 35% 32%,
                        #e8ff6a 0%,
                        #c8f400 38%,
                        #86b000 75%,
                        #5a7800 100%
                    );
                    box-shadow:
                        inset -3px -4px 8px rgba(0,0,0,0.35),
                        inset 2px 2px 6px rgba(255,255,180,0.45),
                        0 0 ${.3*a}px rgba(180,255,0,0.25);
                    position: relative;
                    flex-shrink: 0;
                    transform-origin: center bottom;
                    animation: ${g}-bounce ${c}ms cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }

                /* L\xedneas de costura */
                .${g}-ball::before,
                .${g}-ball::after {
                    content: '';
                    position: absolute;
                    border: 1.5px solid rgba(255,255,255,0.18);
                    border-radius: 50%;
                }
                .${g}-ball::before {
                    width: 55%;
                    height: 100%;
                    left: 22%;
                    top: 0;
                    border-left-color: transparent;
                    border-right-color: transparent;
                    transform: rotate(12deg);
                }
                .${g}-ball::after {
                    width: 100%;
                    height: 55%;
                    left: 0;
                    top: 22%;
                    border-top-color: transparent;
                    border-bottom-color: transparent;
                    transform: rotate(-12deg);
                }

                /* ── SOMBRA ── */
                .${g}-shadow {
                    width: ${.55*a}px;
                    height: ${.14*a}px;
                    background: radial-gradient(ellipse, rgba(180,255,0,0.45) 0%, rgba(0,0,0,0) 75%);
                    border-radius: 50%;
                    flex-shrink: 0;
                    animation: ${g}-shadow ${c}ms cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }

                /* ── KEYFRAMES PELOTA ── */
                @keyframes ${g}-bounce {
                    0%   { transform: translateY(0px) scaleX(1) scaleY(1); }
                    15%  { transform: translateY(-${.25*f}px) scaleX(1) scaleY(1); }
                    45%  { transform: translateY(-${f}px) scaleX(1) scaleY(1); }
                    75%  { transform: translateY(-${.05*f}px) scaleX(1) scaleY(1); }
                    /* squash al tocar el suelo */
                    88%  { transform: translateY(${.05*a}px) scaleX(1.22) scaleY(0.82); }
                    100% { transform: translateY(0px) scaleX(1) scaleY(1); }
                }

                /* ── KEYFRAMES SOMBRA ── */
                @keyframes ${g}-shadow {
                    /* pelota arriba = sombra peque\xf1a y tenue */
                    0%   { transform: scaleX(1);    opacity: 0.65; }
                    15%  { transform: scaleX(0.75); opacity: 0.4;  }
                    45%  { transform: scaleX(0.35); opacity: 0.18; }
                    75%  { transform: scaleX(0.9);  opacity: 0.6;  }
                    /* squash: sombra ancha al m\xe1ximo impacto */
                    88%  { transform: scaleX(1.25); opacity: 0.85; }
                    100% { transform: scaleX(1);    opacity: 0.65; }
                }
            `}),(0,b.jsxs)("div",{className:`${g}-wrap ${e}`,role:"img","aria-label":"Pelota de pádel",children:[(0,b.jsx)("div",{className:`${g}-ball`}),(0,b.jsx)("div",{className:`${g}-shadow`,style:{marginTop:`${.05*a}px`}})]})]})}a.s(["BouncingBall",()=>c,"default",0,c])},546842,a=>{"use strict";let b=(0,a.i(170106).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);a.s(["User",()=>b],546842)},220005,a=>{"use strict";let b=(0,a.i(170106).default)("log-out",[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]);a.s(["LogOut",()=>b],220005)}];

//# sourceMappingURL=_242f9965._.js.map