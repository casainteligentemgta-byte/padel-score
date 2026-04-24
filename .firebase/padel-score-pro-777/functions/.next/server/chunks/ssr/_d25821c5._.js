module.exports=[643389,a=>{"use strict";var b=a.i(50944);function c(a){let c=(0,b.useParams)(),d=c?.[a];return(Array.isArray(d)?d[0]:d)??""}a.s(["useRouteSegment",()=>c])},583077,a=>{"use strict";let b=(0,a.i(170106).default)("trophy",[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",key:"1n3hpd"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",key:"rfe1zi"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18",key:"7xy6bh"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6",key:"tex48p"}]]);a.s(["Trophy",()=>b],583077)},357374,a=>{"use strict";var b=a.i(187924);function c({size:a=36,duration:c=700,bounceHeight:d=2.2,className:e=""}){let f=a*d,g=`bb-${a}-${c}`;return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("style",{children:`
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
            `}),(0,b.jsxs)("div",{className:`${g}-wrap ${e}`,role:"img","aria-label":"Pelota de pádel",children:[(0,b.jsx)("div",{className:`${g}-ball`}),(0,b.jsx)("div",{className:`${g}-shadow`,style:{marginTop:`${.05*a}px`}})]})]})}a.s(["BouncingBall",()=>c,"default",0,c])},596221,a=>{"use strict";let b=(0,a.i(170106).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);a.s(["Loader2",()=>b],596221)},466384,a=>{"use strict";let b=(0,a.i(170106).default)("shield-alert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);a.s(["ShieldAlert",()=>b],466384)},429601,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(50944),e=a.i(338393),f=a.i(942687),g=a.i(849708),h=a.i(583077),i=a.i(466384),j=a.i(167453),k=a.i(596221),l=a.i(357374),m=a.i(643389);function n(){let a=(0,m.useRouteSegment)("id"),n=(0,d.useRouter)(),{user:o,loading:p}=(0,e.useAuth)(),[q,r]=(0,c.useState)("loading"),[s,t]=(0,c.useState)(null),[u,v]=(0,c.useState)(null),[w,x]=(0,c.useState)(null),[y,z]=(0,c.useState)(null),[A,B]=(0,c.useState)(null);(0,c.useEffect)(()=>{if(p||!o?.uid){p||o||n.replace("/login");return}let b=a?.split("--"),c=b?.[0],d=b?.[1];if(!c||!d){r("forbidden"),B("Enlace inválido.");return}let e=!1;return(async()=>{try{let[a,b]=await Promise.all([f.dataService.getMatches(c),f.dataService.getMyParticipants(o.uid)]);if(e)return;let g=(a||[]).find(a=>a.id===d);if(!g){r("forbidden"),B("Partido no encontrado.");return}let h=[g.team1?.p1?.id,g.team1?.p2?.id,g.team2?.p1?.id,g.team2?.p2?.id].filter(Boolean),i=b?.[0]?.id;if(!i||!h.includes(i)){r("forbidden"),B("Solo los 4 jugadores del partido pueden cargar el resultado.");return}let j=i===g.team1?.p1?.id||i===g.team1?.p2?.id;v(c),x(d),t(g),z(j?1:2),r("ready")}catch(a){e||(r("forbidden"),B("Error al cargar el partido."))}})(),()=>{e=!0}},[a,o?.uid,p,n]);let C=async a=>{if(u&&w&&s&&"ready"===q){r("sending"),B(null);try{let b=await (0,g.getAuthHeaders)(),c=await fetch("/api/match/report",{method:"POST",headers:{"Content-Type":"application/json",...b},body:JSON.stringify({compositeId:`${u}--${w}`,winnerTeam:a})}),d=await c.json().catch(()=>({}));if(!c.ok){B(d.error||"No se pudo guardar el resultado. Intenta de nuevo."),r("ready");return}r("done")}catch(a){B("No se pudo guardar el resultado. Intenta de nuevo."),r("ready")}}};if(p||"loading"===q)return(0,b.jsxs)("div",{className:"min-h-screen bg-surface flex flex-col items-center justify-center p-6 overflow-hidden",children:[(0,b.jsx)(l.BouncingBall,{size:40,bounceHeight:2}),(0,b.jsx)("p",{className:"mt-4 text-sm text-white/60",children:"Cargando partido..."})]});if("forbidden"===q)return(0,b.jsx)("div",{className:"min-h-screen bg-surface flex flex-col items-center justify-center p-6 overflow-hidden",children:(0,b.jsxs)("div",{className:"rounded-2xl border border-red-500/30 bg-red-500/10 p-6 max-w-sm text-center",children:[(0,b.jsx)(i.ShieldAlert,{className:"w-12 h-12 text-red-400 mx-auto mb-3"}),(0,b.jsx)("h1",{className:"text-lg font-black text-white uppercase tracking-tight mb-2",children:"No autorizado"}),(0,b.jsx)("p",{className:"text-sm text-white/80",children:A}),(0,b.jsx)("button",{type:"button",onClick:()=>n.push("/dashboard"),className:"mt-4 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm",children:"Volver al Hub"})]})});if("done"===q)return(0,b.jsx)("div",{className:"min-h-screen bg-surface flex flex-col items-center justify-center p-6 overflow-hidden",children:(0,b.jsxs)("div",{className:"rounded-2xl border border-brand/40 bg-surfaceCard p-6 max-w-sm text-center",children:[(0,b.jsx)(j.CheckCircle2,{className:"w-14 h-14 text-brand mx-auto mb-3"}),(0,b.jsx)("h1",{className:"text-lg font-black text-white uppercase tracking-tight mb-2",children:"Resultado guardado"}),(0,b.jsx)("p",{className:"text-sm text-white/70 mb-4",children:"El marcador se ha actualizado correctamente."}),(0,b.jsx)("button",{type:"button",onClick:()=>n.push(`/tournaments/${u}`),className:"px-6 py-3 rounded-xl bg-brand text-black font-black text-sm uppercase",children:"Ver torneo"})]})});if("ready"!==q&&"sending"!==q||!s||null===y)return null;let D="sending"===q,E=s.team1Name||(s.team1?.p1?.name?[s.team1.p1.name,s.team1.p2?.name].filter(Boolean).join(" / "):"Equipo 1"),F=s.team2Name||(s.team2?.p1?.name?[s.team2.p1.name,s.team2.p2?.name].filter(Boolean).join(" / "):"Equipo 2");return(0,b.jsx)("div",{className:"min-h-screen bg-surface text-white flex flex-col items-center justify-center p-4 overflow-hidden",children:(0,b.jsxs)("div",{className:"w-full max-w-md rounded-2xl border border-white/10 bg-surfaceCard p-6",children:[(0,b.jsx)("h1",{className:"text-center text-sm font-black uppercase tracking-widest text-white/60 mb-2",children:"Reportar resultado"}),(0,b.jsx)("p",{className:"text-center text-xs text-white/50 mb-6",children:"¿Quién ganó el partido?"}),(0,b.jsxs)("div",{className:"space-y-3 mb-6",children:[(0,b.jsx)("p",{className:"text-[10px] font-bold text-white/40 uppercase",children:"Equipo 1"}),(0,b.jsx)("p",{className:"text-sm font-bold text-white truncate",children:E}),(0,b.jsx)("p",{className:"text-[10px] font-bold text-white/40 uppercase mt-3",children:"Equipo 2"}),(0,b.jsx)("p",{className:"text-sm font-bold text-white truncate",children:F})]}),A&&(0,b.jsx)("p",{className:"text-red-400 text-sm text-center mb-4",children:A}),(0,b.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,b.jsx)("button",{type:"button",disabled:D,onClick:()=>C(1),className:"min-h-[72px] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-brand/50 bg-brand/10 text-brand font-black uppercase text-sm tracking-tight active:scale-95 transition-transform touch-manipulation",children:D?(0,b.jsx)(k.Loader2,{className:"w-6 h-6 animate-spin"}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(h.Trophy,{className:"w-7 h-7"}),(0,b.jsx)("span",{children:"Ganó Equipo 1"})]})}),(0,b.jsx)("button",{type:"button",disabled:D,onClick:()=>C(2),className:"min-h-[72px] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-brand/50 bg-brand/10 text-brand font-black uppercase text-sm tracking-tight active:scale-95 transition-transform touch-manipulation",children:D?(0,b.jsx)(k.Loader2,{className:"w-6 h-6 animate-spin"}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(h.Trophy,{className:"w-7 h-7"}),(0,b.jsx)("span",{children:"Ganó Equipo 2"})]})})]}),(0,b.jsx)("p",{className:"mt-4 text-[10px] text-white/40 text-center",children:"Solo los jugadores del partido pueden enviar el resultado."})]})})}a.s(["default",()=>n])}];

//# sourceMappingURL=_d25821c5._.js.map