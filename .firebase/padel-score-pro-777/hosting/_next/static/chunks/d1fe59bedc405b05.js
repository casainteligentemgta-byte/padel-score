(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,199267,e=>{"use strict";var t=e.i(618566);function a(e){let a=(0,t.useParams)(),r=a?.[e];return(Array.isArray(r)?r[0]:r)??""}e.s(["useRouteSegment",()=>a])},664030,e=>{"use strict";let t=(0,e.i(475254).default)("trophy",[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",key:"1n3hpd"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",key:"rfe1zi"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18",key:"7xy6bh"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6",key:"tex48p"}]]);e.s(["Trophy",()=>t],664030)},917400,e=>{"use strict";var t=e.i(843476);function a({size:e=36,duration:a=700,bounceHeight:r=2.2,className:s=""}){let i=e*r,n=`bb-${e}-${a}`;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:`
                /* ── Contenedor vertical — ocupa la altura del viaje + pelota + sombra ── */
                .${n}-wrap {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    height: ${i+e+.28*e}px;
                    width: ${1.2*e}px;
                    position: relative;
                    flex-shrink: 0;
                    margin-bottom: 2px;
                }

                /* ── PELOTA ── */
                .${n}-ball {
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
                    animation: ${n}-bounce ${a}ms cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }

                /* L\xedneas de costura */
                .${n}-ball::before,
                .${n}-ball::after {
                    content: '';
                    position: absolute;
                    border: 1.5px solid rgba(255,255,255,0.18);
                    border-radius: 50%;
                }
                .${n}-ball::before {
                    width: 55%;
                    height: 100%;
                    left: 22%;
                    top: 0;
                    border-left-color: transparent;
                    border-right-color: transparent;
                    transform: rotate(12deg);
                }
                .${n}-ball::after {
                    width: 100%;
                    height: 55%;
                    left: 0;
                    top: 22%;
                    border-top-color: transparent;
                    border-bottom-color: transparent;
                    transform: rotate(-12deg);
                }

                /* ── SOMBRA ── */
                .${n}-shadow {
                    width: ${.55*e}px;
                    height: ${.14*e}px;
                    background: radial-gradient(ellipse, rgba(180,255,0,0.45) 0%, rgba(0,0,0,0) 75%);
                    border-radius: 50%;
                    flex-shrink: 0;
                    animation: ${n}-shadow ${a}ms cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                }

                /* ── KEYFRAMES PELOTA ── */
                @keyframes ${n}-bounce {
                    0%   { transform: translateY(0px) scaleX(1) scaleY(1); }
                    15%  { transform: translateY(-${.25*i}px) scaleX(1) scaleY(1); }
                    45%  { transform: translateY(-${i}px) scaleX(1) scaleY(1); }
                    75%  { transform: translateY(-${.05*i}px) scaleX(1) scaleY(1); }
                    /* squash al tocar el suelo */
                    88%  { transform: translateY(${.05*e}px) scaleX(1.22) scaleY(0.82); }
                    100% { transform: translateY(0px) scaleX(1) scaleY(1); }
                }

                /* ── KEYFRAMES SOMBRA ── */
                @keyframes ${n}-shadow {
                    /* pelota arriba = sombra peque\xf1a y tenue */
                    0%   { transform: scaleX(1);    opacity: 0.65; }
                    15%  { transform: scaleX(0.75); opacity: 0.4;  }
                    45%  { transform: scaleX(0.35); opacity: 0.18; }
                    75%  { transform: scaleX(0.9);  opacity: 0.6;  }
                    /* squash: sombra ancha al m\xe1ximo impacto */
                    88%  { transform: scaleX(1.25); opacity: 0.85; }
                    100% { transform: scaleX(1);    opacity: 0.65; }
                }
            `}),(0,t.jsxs)("div",{className:`${n}-wrap ${s}`,role:"img","aria-label":"Pelota de pádel",children:[(0,t.jsx)("div",{className:`${n}-ball`}),(0,t.jsx)("div",{className:`${n}-shadow`,style:{marginTop:`${.05*e}px`}})]})]})}e.s(["BouncingBall",()=>a,"default",0,a])},531278,e=>{"use strict";let t=(0,e.i(475254).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);e.s(["Loader2",()=>t],531278)},751737,e=>{"use strict";let t=(0,e.i(475254).default)("shield-alert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);e.s(["ShieldAlert",()=>t],751737)},220358,e=>{"use strict";var t=e.i(843476),a=e.i(271645),r=e.i(618566),s=e.i(85205),i=e.i(721954),n=e.i(794398),l=e.i(664030),o=e.i(751737),d=e.i(595468),c=e.i(531278),p=e.i(917400),u=e.i(199267);function m(){let e=(0,u.useRouteSegment)("id"),m=(0,r.useRouter)(),{user:x,loading:h}=(0,s.useAuth)(),[b,f]=(0,a.useState)("loading"),[g,y]=(0,a.useState)(null),[j,w]=(0,a.useState)(null),[N,v]=(0,a.useState)(null),[k,$]=(0,a.useState)(null),[S,A]=(0,a.useState)(null);(0,a.useEffect)(()=>{if(h||!x?.uid){h||x||m.replace("/login");return}let t=e?.split("--"),a=t?.[0],r=t?.[1];if(!a||!r){f("forbidden"),A("Enlace inválido.");return}let s=!1;return(async()=>{try{let[e,t]=await Promise.all([i.dataService.getMatches(a),i.dataService.getMyParticipants(x.uid)]);if(s)return;let n=(e||[]).find(e=>e.id===r);if(!n){f("forbidden"),A("Partido no encontrado.");return}let l=[n.team1?.p1?.id,n.team1?.p2?.id,n.team2?.p1?.id,n.team2?.p2?.id].filter(Boolean),o=t?.[0]?.id;if(!o||!l.includes(o)){f("forbidden"),A("Solo los 4 jugadores del partido pueden cargar el resultado.");return}let d=o===n.team1?.p1?.id||o===n.team1?.p2?.id;w(a),v(r),y(n),$(d?1:2),f("ready")}catch(e){s||(f("forbidden"),A("Error al cargar el partido."))}})(),()=>{s=!0}},[e,x?.uid,h,m]);let E=async e=>{if(j&&N&&g&&"ready"===b){f("sending"),A(null);try{let t=await (0,n.getAuthHeaders)(),a=await fetch("/api/match/report",{method:"POST",headers:{"Content-Type":"application/json",...t},body:JSON.stringify({compositeId:`${j}--${N}`,winnerTeam:e})}),r=await a.json().catch(()=>({}));if(!a.ok){A(r.error||"No se pudo guardar el resultado. Intenta de nuevo."),f("ready");return}f("done")}catch(e){A("No se pudo guardar el resultado. Intenta de nuevo."),f("ready")}}};if(h||"loading"===b)return(0,t.jsxs)("div",{className:"min-h-screen bg-surface flex flex-col items-center justify-center p-6 overflow-hidden",children:[(0,t.jsx)(p.BouncingBall,{size:40,bounceHeight:2}),(0,t.jsx)("p",{className:"mt-4 text-sm text-white/60",children:"Cargando partido..."})]});if("forbidden"===b)return(0,t.jsx)("div",{className:"min-h-screen bg-surface flex flex-col items-center justify-center p-6 overflow-hidden",children:(0,t.jsxs)("div",{className:"rounded-2xl border border-red-500/30 bg-red-500/10 p-6 max-w-sm text-center",children:[(0,t.jsx)(o.ShieldAlert,{className:"w-12 h-12 text-red-400 mx-auto mb-3"}),(0,t.jsx)("h1",{className:"text-lg font-black text-white uppercase tracking-tight mb-2",children:"No autorizado"}),(0,t.jsx)("p",{className:"text-sm text-white/80",children:S}),(0,t.jsx)("button",{type:"button",onClick:()=>m.push("/dashboard"),className:"mt-4 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm",children:"Volver al Hub"})]})});if("done"===b)return(0,t.jsx)("div",{className:"min-h-screen bg-surface flex flex-col items-center justify-center p-6 overflow-hidden",children:(0,t.jsxs)("div",{className:"rounded-2xl border border-brand/40 bg-surfaceCard p-6 max-w-sm text-center",children:[(0,t.jsx)(d.CheckCircle2,{className:"w-14 h-14 text-brand mx-auto mb-3"}),(0,t.jsx)("h1",{className:"text-lg font-black text-white uppercase tracking-tight mb-2",children:"Resultado guardado"}),(0,t.jsx)("p",{className:"text-sm text-white/70 mb-4",children:"El marcador se ha actualizado correctamente."}),(0,t.jsx)("button",{type:"button",onClick:()=>m.push(`/tournaments/${j}`),className:"px-6 py-3 rounded-xl bg-brand text-black font-black text-sm uppercase",children:"Ver torneo"})]})});if("ready"!==b&&"sending"!==b||!g||null===k)return null;let M="sending"===b,C=g.team1Name||(g.team1?.p1?.name?[g.team1.p1.name,g.team1.p2?.name].filter(Boolean).join(" / "):"Equipo 1"),Y=g.team2Name||(g.team2?.p1?.name?[g.team2.p1.name,g.team2.p2?.name].filter(Boolean).join(" / "):"Equipo 2");return(0,t.jsx)("div",{className:"min-h-screen bg-surface text-white flex flex-col items-center justify-center p-4 overflow-hidden",children:(0,t.jsxs)("div",{className:"w-full max-w-md rounded-2xl border border-white/10 bg-surfaceCard p-6",children:[(0,t.jsx)("h1",{className:"text-center text-sm font-black uppercase tracking-widest text-white/60 mb-2",children:"Reportar resultado"}),(0,t.jsx)("p",{className:"text-center text-xs text-white/50 mb-6",children:"¿Quién ganó el partido?"}),(0,t.jsxs)("div",{className:"space-y-3 mb-6",children:[(0,t.jsx)("p",{className:"text-[10px] font-bold text-white/40 uppercase",children:"Equipo 1"}),(0,t.jsx)("p",{className:"text-sm font-bold text-white truncate",children:C}),(0,t.jsx)("p",{className:"text-[10px] font-bold text-white/40 uppercase mt-3",children:"Equipo 2"}),(0,t.jsx)("p",{className:"text-sm font-bold text-white truncate",children:Y})]}),S&&(0,t.jsx)("p",{className:"text-red-400 text-sm text-center mb-4",children:S}),(0,t.jsxs)("div",{className:"grid grid-cols-2 gap-4",children:[(0,t.jsx)("button",{type:"button",disabled:M,onClick:()=>E(1),className:"min-h-[72px] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-brand/50 bg-brand/10 text-brand font-black uppercase text-sm tracking-tight active:scale-95 transition-transform touch-manipulation",children:M?(0,t.jsx)(c.Loader2,{className:"w-6 h-6 animate-spin"}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(l.Trophy,{className:"w-7 h-7"}),(0,t.jsx)("span",{children:"Ganó Equipo 1"})]})}),(0,t.jsx)("button",{type:"button",disabled:M,onClick:()=>E(2),className:"min-h-[72px] flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-brand/50 bg-brand/10 text-brand font-black uppercase text-sm tracking-tight active:scale-95 transition-transform touch-manipulation",children:M?(0,t.jsx)(c.Loader2,{className:"w-6 h-6 animate-spin"}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(l.Trophy,{className:"w-7 h-7"}),(0,t.jsx)("span",{children:"Ganó Equipo 2"})]})})]}),(0,t.jsx)("p",{className:"mt-4 text-[10px] text-white/40 text-center",children:"Solo los jugadores del partido pueden enviar el resultado."})]})})}e.s(["default",()=>m])}]);