(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,16715,e=>{"use strict";let a=(0,e.i(475254).default)("refresh-cw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);e.s(["RefreshCw",()=>a],16715)},664030,e=>{"use strict";let a=(0,e.i(475254).default)("trophy",[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",key:"1n3hpd"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",key:"rfe1zi"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18",key:"7xy6bh"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6",key:"tex48p"}]]);e.s(["Trophy",()=>a],664030)},917400,e=>{"use strict";var a=e.i(843476);function t({size:e=36,duration:t=700,bounceHeight:s=2.2,className:r=""}){let l=e*s,i=`bb-${e}-${t}`;return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("style",{children:`
                /* ── Contenedor vertical — ocupa la altura del viaje + pelota + sombra ── */
                .${i}-wrap {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    height: ${l+e+.28*e}px;
                    width: ${1.2*e}px;
                    position: relative;
                    flex-shrink: 0;
                    margin-bottom: 2px;
                }

                /* ── PELOTA ── */
                .${i}-ball {
                    width: ${e}px;
                    height: ${e}px;
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
                        0 0 ${.3*e}px rgba(180,255,0,0.25);
                    position: relative;
                    flex-shrink: 0;
                    transform-origin: center bottom;
                    animation: ${i}-bounce ${t}ms cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }

                /* L\xedneas de costura */
                .${i}-ball::before,
                .${i}-ball::after {
                    content: '';
                    position: absolute;
                    border: 1.5px solid rgba(255,255,255,0.18);
                    border-radius: 50%;
                }
                .${i}-ball::before {
                    width: 55%;
                    height: 100%;
                    left: 22%;
                    top: 0;
                    border-left-color: transparent;
                    border-right-color: transparent;
                    transform: rotate(12deg);
                }
                .${i}-ball::after {
                    width: 100%;
                    height: 55%;
                    left: 0;
                    top: 22%;
                    border-top-color: transparent;
                    border-bottom-color: transparent;
                    transform: rotate(-12deg);
                }

                /* ── SOMBRA ── */
                .${i}-shadow {
                    width: ${.55*e}px;
                    height: ${.14*e}px;
                    background: radial-gradient(ellipse, rgba(180,255,0,0.45) 0%, rgba(0,0,0,0) 75%);
                    border-radius: 50%;
                    flex-shrink: 0;
                    animation: ${i}-shadow ${t}ms cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }

                /* ── KEYFRAMES PELOTA ── */
                @keyframes ${i}-bounce {
                    0%   { transform: translateY(0px) scaleX(1) scaleY(1); }
                    15%  { transform: translateY(-${.25*l}px) scaleX(1) scaleY(1); }
                    45%  { transform: translateY(-${l}px) scaleX(1) scaleY(1); }
                    75%  { transform: translateY(-${.05*l}px) scaleX(1) scaleY(1); }
                    /* squash al tocar el suelo */
                    88%  { transform: translateY(${.05*e}px) scaleX(1.22) scaleY(0.82); }
                    100% { transform: translateY(0px) scaleX(1) scaleY(1); }
                }

                /* ── KEYFRAMES SOMBRA ── */
                @keyframes ${i}-shadow {
                    /* pelota arriba = sombra peque\xf1a y tenue */
                    0%   { transform: scaleX(1);    opacity: 0.65; }
                    15%  { transform: scaleX(0.75); opacity: 0.4;  }
                    45%  { transform: scaleX(0.35); opacity: 0.18; }
                    75%  { transform: scaleX(0.9);  opacity: 0.6;  }
                    /* squash: sombra ancha al m\xe1ximo impacto */
                    88%  { transform: scaleX(1.25); opacity: 0.85; }
                    100% { transform: scaleX(1);    opacity: 0.65; }
                }
            `}),(0,a.jsxs)("div",{className:`${i}-wrap ${r}`,role:"img","aria-label":"Pelota de pádel",children:[(0,a.jsx)("div",{className:`${i}-ball`}),(0,a.jsx)("div",{className:`${i}-shadow`,style:{marginTop:`${.05*e}px`}})]})]})}e.s(["BouncingBall",()=>t,"default",0,t])},784243,e=>{"use strict";let a=(0,e.i(475254).default)("medal",[["path",{d:"M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15",key:"143lza"}],["path",{d:"M11 12 5.12 2.2",key:"qhuxz6"}],["path",{d:"m13 12 5.88-9.8",key:"hbye0f"}],["path",{d:"M8 7h8",key:"i86dvs"}],["circle",{cx:"12",cy:"17",r:"5",key:"qbz8iq"}],["path",{d:"M12 18v-2h-.5",key:"fawc4q"}]]);e.s(["Medal",()=>a],784243)},871689,e=>{"use strict";let a=(0,e.i(475254).default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);e.s(["ArrowLeft",()=>a],871689)},198477,e=>{"use strict";var a=e.i(843476),t=e.i(871689),s=e.i(522016),r=e.i(618566);function l({href:e,ariaLabel:l="Volver",className:i=""}){let n=(0,r.useRouter)(),o="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 border border-white/15 text-gray-200";return e?(0,a.jsx)(s.default,{href:e,"aria-label":l,className:`${o} ${i}`.trim(),children:(0,a.jsx)(t.ArrowLeft,{className:"w-5 h-5"})}):(0,a.jsx)("button",{type:"button",onClick:()=>n.back(),"aria-label":l,className:`${o} ${i}`.trim(),children:(0,a.jsx)(t.ArrowLeft,{className:"w-5 h-5"})})}e.s(["BackButton",()=>l])},132225,e=>{"use strict";var a=e.i(843476),t=e.i(85205);let s=(0,e.i(475254).default)("log-in",[["path",{d:"m10 17 5-5-5-5",key:"1bsop3"}],["path",{d:"M15 12H3",key:"6jk70r"}],["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}]]);var r=e.i(522016);function l(){let{user:e,logout:l}=(0,t.useAuth)();return e?(0,a.jsxs)("div",{className:"flex items-center gap-4",children:[(0,a.jsxs)("div",{className:"flex flex-col items-end",children:[(0,a.jsx)("span",{className:"text-white font-bold text-sm leading-none",children:e.displayName}),(0,a.jsx)("button",{onClick:l,className:"text-[10px] text-gray-500 hover:text-red-400 font-black uppercase tracking-widest mt-1 transition-colors",children:"Cerrar Sesión"})]}),e.photoURL?(0,a.jsx)("img",{src:e.photoURL,alt:"Profile",className:"w-10 h-10 rounded-full border border-padel-primary/30"}):(0,a.jsx)("div",{className:"w-10 h-10 rounded-full bg-padel-primary flex items-center justify-center text-black font-black",children:e.displayName?.charAt(0)||"U"})]}):(0,a.jsx)("div",{className:"flex flex-col items-end gap-2 text-right",children:(0,a.jsxs)(r.default,{href:"/login",className:"flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-xl transition-all group shadow-xl",children:[(0,a.jsx)(s,{className:"w-4 h-4 text-padel-primary group-hover:translate-x-1 transition-transform"}),(0,a.jsx)("span",{className:"text-xs font-black uppercase tracking-widest",children:"Acceder a Mi Cuenta"})]})})}e.s(["default",()=>l],132225)},845073,e=>{"use strict";var a=e.i(843476),t=e.i(271645),s=e.i(85205),r=e.i(721954),l=e.i(784243),i=e.i(664030),n=e.i(16715),o=e.i(198477),c=e.i(917400),d=e.i(132225),x=e.i(846932),m=e.i(88653);function p(){let{user:e,loading:p}=(0,s.useAuth)(),[h,u]=(0,t.useState)("general"),[b,f]=(0,t.useState)([]),[g,y]=(0,t.useState)(""),[w,k]=(0,t.useState)(!0);return((0,t.useEffect)(()=>{if(!e)return void k(!1);let a=!1;return(async()=>{try{let t=await r.dataService.getMyTournaments(e.uid);!a&&(f(t.map(e=>({id:e.id,name:e.name||e.tournamentName||"Sin nombre"}))),t.length>0&&y(e=>e||t[0].id))}catch(e){console.error(e)}finally{a||k(!1)}})(),()=>{a=!0}},[e]),p||w)?(0,a.jsx)("div",{className:"min-h-screen bg-black flex items-center justify-center",children:(0,a.jsx)(n.RefreshCw,{className:"w-8 h-8 text-padel-primary animate-spin"})}):e?(0,a.jsxs)("div",{className:"ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative",children:[(0,a.jsxs)("header",{className:"sticky top-0 z-50 flex items-center gap-2 border-b border-white/5 bg-[#0a0a0a]/95 px-3 py-2.5 backdrop-blur-xl pt-[max(0.35rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:py-3",children:[(0,a.jsx)(o.BackButton,{href:"/dashboard",ariaLabel:"Volver al inicio",className:"shrink-0"}),(0,a.jsxs)("div",{className:"flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-center",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2 sm:gap-3",children:[(0,a.jsx)(c.BouncingBall,{size:20,className:"sm:h-6 sm:w-6"}),(0,a.jsx)("h1",{className:"text-lg font-black italic uppercase tracking-tighter text-white sm:text-xl md:text-2xl",children:"Ranking"})]}),(0,a.jsx)("p",{className:"text-[9px] font-bold uppercase tracking-widest text-gray-500 sm:text-[10px]",children:"General y por torneo"})]}),(0,a.jsx)("div",{className:"h-10 w-10 shrink-0 sm:w-10","aria-hidden":!0})]}),(0,a.jsx)("main",{className:"ipad-scroll-area px-4 pb-12 pt-4 sm:px-6",children:(0,a.jsxs)("div",{className:"mx-auto w-full max-w-lg space-y-5 sm:max-w-4xl sm:space-y-6",children:[(0,a.jsxs)("div",{className:"flex w-full flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center",children:[(0,a.jsxs)("div",{className:"mx-auto flex w-full max-w-sm flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 sm:mx-0 sm:max-w-none sm:flex-row sm:gap-0",children:[(0,a.jsxs)("button",{type:"button",onClick:()=>u("general"),className:`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest sm:w-auto sm:px-5 sm:py-2.5 ${"general"===h?"bg-padel-primary text-black":"text-gray-500 hover:text-white"}`,children:[(0,a.jsx)(i.Trophy,{className:"h-4 w-4 shrink-0"})," General"]}),(0,a.jsxs)("button",{type:"button",onClick:()=>u("torneo"),className:`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest sm:w-auto sm:px-5 sm:py-2.5 ${"torneo"===h?"bg-padel-primary text-black":"text-gray-500 hover:text-white"}`,children:[(0,a.jsx)(l.Medal,{className:"h-4 w-4 shrink-0"})," Por torneo"]})]}),"torneo"===h&&b.length>0&&(0,a.jsx)("select",{value:g,onChange:e=>y(e.target.value),className:"w-full max-w-sm self-center rounded-xl border border-white/20 bg-black/50 py-3 pl-4 pr-10 text-sm font-bold text-white appearance-none focus:border-padel-primary focus:outline-none sm:max-w-xs sm:py-2.5",children:b.map(e=>(0,a.jsx)("option",{value:e.id,children:e.name},e.id))})]}),(0,a.jsx)(m.AnimatePresence,{mode:"wait",children:"general"===h?(0,a.jsxs)(x.motion.section,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},className:"rounded-2xl border border-white/10 bg-[#111] p-4 sm:rounded-3xl sm:p-6 md:p-8",children:[(0,a.jsx)("h2",{className:"mb-3 text-base font-black uppercase tracking-wider text-padel-primary sm:text-lg",children:"Ranking general"}),(0,a.jsx)("p",{className:"mb-4 text-sm text-gray-500",children:"Clasificación global según resultados en todos los torneos."}),(0,a.jsxs)("div",{className:"rounded-xl border border-white/5 bg-black/30 px-4 py-8 text-center sm:p-8",children:[(0,a.jsx)(l.Medal,{className:"mx-auto mb-3 h-10 w-10 text-padel-primary/30 sm:h-12 sm:w-12"}),(0,a.jsx)("p",{className:"text-sm text-gray-500",children:"Los datos de ranking general se mostrarán aquí cuando estén disponibles."})]})]},"general"):(0,a.jsxs)(x.motion.section,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},className:"rounded-2xl border border-white/10 bg-[#111] p-4 sm:rounded-3xl sm:p-6 md:p-8",children:[(0,a.jsx)("h2",{className:"mb-3 text-base font-black uppercase tracking-wider text-padel-primary sm:text-lg",children:"Ranking del torneo"}),0===b.length?(0,a.jsx)("p",{className:"text-sm text-gray-500",children:"No tienes torneos. Crea o participa en uno para ver el ranking por torneo."}):(0,a.jsxs)("div",{className:"rounded-xl border border-white/5 bg-black/30 px-4 py-8 text-center sm:p-8",children:[(0,a.jsx)(i.Trophy,{className:"mx-auto mb-3 h-10 w-10 text-padel-primary/30 sm:h-12 sm:w-12"}),(0,a.jsx)("p",{className:"text-sm text-gray-500",children:"El ranking del torneo seleccionado se mostrará aquí."})]})]},"torneo")})]})})]}):(0,a.jsxs)("div",{className:"min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center",children:[(0,a.jsx)(l.Medal,{className:"w-20 h-20 text-padel-primary/20 mb-8"}),(0,a.jsx)("h1",{className:"text-4xl font-black italic uppercase tracking-tighter mb-4",children:"Inicia Sesión"}),(0,a.jsx)("p",{className:"text-gray-500 max-w-md mb-8",children:"Inicia sesión para ver el ranking."}),(0,a.jsx)(d.default,{})]})}e.s(["default",()=>p])}]);