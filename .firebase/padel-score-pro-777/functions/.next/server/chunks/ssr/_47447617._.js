module.exports=[669520,a=>{"use strict";let b=(0,a.i(170106).default)("refresh-cw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);a.s(["RefreshCw",()=>b],669520)},583077,a=>{"use strict";let b=(0,a.i(170106).default)("trophy",[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",key:"1n3hpd"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",key:"rfe1zi"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18",key:"7xy6bh"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6",key:"tex48p"}]]);a.s(["Trophy",()=>b],583077)},357374,a=>{"use strict";var b=a.i(187924);function c({size:a=36,duration:c=700,bounceHeight:d=2.2,className:e=""}){let f=a*d,g=`bb-${a}-${c}`;return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("style",{children:`
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
            `}),(0,b.jsxs)("div",{className:`${g}-wrap ${e}`,role:"img","aria-label":"Pelota de pádel",children:[(0,b.jsx)("div",{className:`${g}-ball`}),(0,b.jsx)("div",{className:`${g}-shadow`,style:{marginTop:`${.05*a}px`}})]})]})}a.s(["BouncingBall",()=>c,"default",0,c])},753250,a=>{"use strict";let b=(0,a.i(170106).default)("medal",[["path",{d:"M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15",key:"143lza"}],["path",{d:"M11 12 5.12 2.2",key:"qhuxz6"}],["path",{d:"m13 12 5.88-9.8",key:"hbye0f"}],["path",{d:"M8 7h8",key:"i86dvs"}],["circle",{cx:"12",cy:"17",r:"5",key:"qbz8iq"}],["path",{d:"M12 18v-2h-.5",key:"fawc4q"}]]);a.s(["Medal",()=>b],753250)},400210,a=>{"use strict";let b=(0,a.i(170106).default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);a.s(["ArrowLeft",()=>b],400210)},897463,a=>{"use strict";var b=a.i(187924),c=a.i(400210),d=a.i(238246),e=a.i(50944);function f({href:a,ariaLabel:f="Volver",className:g=""}){let h=(0,e.useRouter)(),i="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 border border-white/15 text-gray-200";return a?(0,b.jsx)(d.default,{href:a,"aria-label":f,className:`${i} ${g}`.trim(),children:(0,b.jsx)(c.ArrowLeft,{className:"w-5 h-5"})}):(0,b.jsx)("button",{type:"button",onClick:()=>h.back(),"aria-label":f,className:`${i} ${g}`.trim(),children:(0,b.jsx)(c.ArrowLeft,{className:"w-5 h-5"})})}a.s(["BackButton",()=>f])},760184,a=>{"use strict";var b=a.i(187924),c=a.i(338393);let d=(0,a.i(170106).default)("log-in",[["path",{d:"m10 17 5-5-5-5",key:"1bsop3"}],["path",{d:"M15 12H3",key:"6jk70r"}],["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}]]);var e=a.i(238246);function f(){let{user:a,logout:f}=(0,c.useAuth)();return a?(0,b.jsxs)("div",{className:"flex items-center gap-4",children:[(0,b.jsxs)("div",{className:"flex flex-col items-end",children:[(0,b.jsx)("span",{className:"text-white font-bold text-sm leading-none",children:a.displayName}),(0,b.jsx)("button",{onClick:f,className:"text-[10px] text-gray-500 hover:text-red-400 font-black uppercase tracking-widest mt-1 transition-colors",children:"Cerrar Sesión"})]}),a.photoURL?(0,b.jsx)("img",{src:a.photoURL,alt:"Profile",className:"w-10 h-10 rounded-full border border-padel-primary/30"}):(0,b.jsx)("div",{className:"w-10 h-10 rounded-full bg-padel-primary flex items-center justify-center text-black font-black",children:a.displayName?.charAt(0)||"U"})]}):(0,b.jsx)("div",{className:"flex flex-col items-end gap-2 text-right",children:(0,b.jsxs)(e.default,{href:"/login",className:"flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-xl transition-all group shadow-xl",children:[(0,b.jsx)(d,{className:"w-4 h-4 text-padel-primary group-hover:translate-x-1 transition-transform"}),(0,b.jsx)("span",{className:"text-xs font-black uppercase tracking-widest",children:"Acceder a Mi Cuenta"})]})})}a.s(["default",()=>f],760184)},236503,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(338393),e=a.i(942687),f=a.i(753250),g=a.i(583077),h=a.i(669520),i=a.i(897463),j=a.i(357374),k=a.i(760184),l=a.i(346271),m=a.i(262036);function n(){let{user:a,loading:n}=(0,d.useAuth)(),[o,p]=(0,c.useState)("general"),[q,r]=(0,c.useState)([]),[s,t]=(0,c.useState)(""),[u,v]=(0,c.useState)(!0);return((0,c.useEffect)(()=>{if(!a)return void v(!1);let b=!1;return(async()=>{try{let c=await e.dataService.getMyTournaments(a.uid);!b&&(r(c.map(a=>({id:a.id,name:a.name||a.tournamentName||"Sin nombre"}))),c.length>0&&t(a=>a||c[0].id))}catch(a){console.error(a)}finally{b||v(!1)}})(),()=>{b=!0}},[a]),n||u)?(0,b.jsx)("div",{className:"min-h-screen bg-black flex items-center justify-center",children:(0,b.jsx)(h.RefreshCw,{className:"w-8 h-8 text-padel-primary animate-spin"})}):a?(0,b.jsxs)("div",{className:"ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative",children:[(0,b.jsxs)("header",{className:"sticky top-0 z-50 flex items-center gap-2 border-b border-white/5 bg-[#0a0a0a]/95 px-3 py-2.5 backdrop-blur-xl pt-[max(0.35rem,env(safe-area-inset-top))] sm:gap-3 sm:px-4 sm:py-3",children:[(0,b.jsx)(i.BackButton,{href:"/dashboard",ariaLabel:"Volver al inicio",className:"shrink-0"}),(0,b.jsxs)("div",{className:"flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-center",children:[(0,b.jsxs)("div",{className:"flex items-center gap-2 sm:gap-3",children:[(0,b.jsx)(j.BouncingBall,{size:20,className:"sm:h-6 sm:w-6"}),(0,b.jsx)("h1",{className:"text-lg font-black italic uppercase tracking-tighter text-white sm:text-xl md:text-2xl",children:"Ranking"})]}),(0,b.jsx)("p",{className:"text-[9px] font-bold uppercase tracking-widest text-gray-500 sm:text-[10px]",children:"General y por torneo"})]}),(0,b.jsx)("div",{className:"h-10 w-10 shrink-0 sm:w-10","aria-hidden":!0})]}),(0,b.jsx)("main",{className:"ipad-scroll-area px-4 pb-12 pt-4 sm:px-6",children:(0,b.jsxs)("div",{className:"mx-auto w-full max-w-lg space-y-5 sm:max-w-4xl sm:space-y-6",children:[(0,b.jsxs)("div",{className:"flex w-full flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center",children:[(0,b.jsxs)("div",{className:"mx-auto flex w-full max-w-sm flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 sm:mx-0 sm:max-w-none sm:flex-row sm:gap-0",children:[(0,b.jsxs)("button",{type:"button",onClick:()=>p("general"),className:`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest sm:w-auto sm:px-5 sm:py-2.5 ${"general"===o?"bg-padel-primary text-black":"text-gray-500 hover:text-white"}`,children:[(0,b.jsx)(g.Trophy,{className:"h-4 w-4 shrink-0"})," General"]}),(0,b.jsxs)("button",{type:"button",onClick:()=>p("torneo"),className:`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest sm:w-auto sm:px-5 sm:py-2.5 ${"torneo"===o?"bg-padel-primary text-black":"text-gray-500 hover:text-white"}`,children:[(0,b.jsx)(f.Medal,{className:"h-4 w-4 shrink-0"})," Por torneo"]})]}),"torneo"===o&&q.length>0&&(0,b.jsx)("select",{value:s,onChange:a=>t(a.target.value),className:"w-full max-w-sm self-center rounded-xl border border-white/20 bg-black/50 py-3 pl-4 pr-10 text-sm font-bold text-white appearance-none focus:border-padel-primary focus:outline-none sm:max-w-xs sm:py-2.5",children:q.map(a=>(0,b.jsx)("option",{value:a.id,children:a.name},a.id))})]}),(0,b.jsx)(m.AnimatePresence,{mode:"wait",children:"general"===o?(0,b.jsxs)(l.motion.section,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},className:"rounded-2xl border border-white/10 bg-[#111] p-4 sm:rounded-3xl sm:p-6 md:p-8",children:[(0,b.jsx)("h2",{className:"mb-3 text-base font-black uppercase tracking-wider text-padel-primary sm:text-lg",children:"Ranking general"}),(0,b.jsx)("p",{className:"mb-4 text-sm text-gray-500",children:"Clasificación global según resultados en todos los torneos."}),(0,b.jsxs)("div",{className:"rounded-xl border border-white/5 bg-black/30 px-4 py-8 text-center sm:p-8",children:[(0,b.jsx)(f.Medal,{className:"mx-auto mb-3 h-10 w-10 text-padel-primary/30 sm:h-12 sm:w-12"}),(0,b.jsx)("p",{className:"text-sm text-gray-500",children:"Los datos de ranking general se mostrarán aquí cuando estén disponibles."})]})]},"general"):(0,b.jsxs)(l.motion.section,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},className:"rounded-2xl border border-white/10 bg-[#111] p-4 sm:rounded-3xl sm:p-6 md:p-8",children:[(0,b.jsx)("h2",{className:"mb-3 text-base font-black uppercase tracking-wider text-padel-primary sm:text-lg",children:"Ranking del torneo"}),0===q.length?(0,b.jsx)("p",{className:"text-sm text-gray-500",children:"No tienes torneos. Crea o participa en uno para ver el ranking por torneo."}):(0,b.jsxs)("div",{className:"rounded-xl border border-white/5 bg-black/30 px-4 py-8 text-center sm:p-8",children:[(0,b.jsx)(g.Trophy,{className:"mx-auto mb-3 h-10 w-10 text-padel-primary/30 sm:h-12 sm:w-12"}),(0,b.jsx)("p",{className:"text-sm text-gray-500",children:"El ranking del torneo seleccionado se mostrará aquí."})]})]},"torneo")})]})})]}):(0,b.jsxs)("div",{className:"min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center",children:[(0,b.jsx)(f.Medal,{className:"w-20 h-20 text-padel-primary/20 mb-8"}),(0,b.jsx)("h1",{className:"text-4xl font-black italic uppercase tracking-tighter mb-4",children:"Inicia Sesión"}),(0,b.jsx)("p",{className:"text-gray-500 max-w-md mb-8",children:"Inicia sesión para ver el ranking."}),(0,b.jsx)(k.default,{})]})}a.s(["default",()=>n])}];

//# sourceMappingURL=_47447617._.js.map