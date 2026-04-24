module.exports=[357374,a=>{"use strict";var b=a.i(187924);function c({size:a=36,duration:c=700,bounceHeight:d=2.2,className:e=""}){let f=a*d,g=`bb-${a}-${c}`;return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("style",{children:`
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
            `}),(0,b.jsxs)("div",{className:`${g}-wrap ${e}`,role:"img","aria-label":"Pelota de pádel",children:[(0,b.jsx)("div",{className:`${g}-ball`}),(0,b.jsx)("div",{className:`${g}-shadow`,style:{marginTop:`${.05*a}px`}})]})]})}a.s(["BouncingBall",()=>c,"default",0,c])},643389,a=>{"use strict";var b=a.i(50944);function c(a){let c=(0,b.useParams)(),d=c?.[a];return(Array.isArray(d)?d[0]:d)??""}a.s(["useRouteSegment",()=>c])},136656,a=>{"use strict";let b=(0,a.i(170106).default)("tv",[["path",{d:"m17 2-5 5-5-5",key:"16satq"}],["rect",{width:"20",height:"15",x:"2",y:"7",rx:"2",key:"1e6viu"}]]);a.s(["Tv",()=>b],136656)},941675,a=>{"use strict";let b=(0,a.i(170106).default)("calendar",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]]);a.s(["Calendar",()=>b],941675)},279003,a=>{"use strict";function b(a){let b=(a||"").trim();if(!b)return"";let c=b.split(/\s+/).filter(Boolean);if(c.length<=1)return b;let d=c[0],e=d.toLowerCase();if("jugador"===e||"pareja"===e||"equipo"===e||/^\d+$/.test(c[c.length-1]))return b;if(2===c.length)return`${c[0]} ${c[1]}`;let f=c[1].charAt(0).toUpperCase(),g=c[2];return`${d} ${f}. ${g}`}a.s(["formatPlayerFichaName",()=>b])},662248,a=>{"use strict";var b=a.i(187924),c=a.i(572131);function d({url:a,videoKey:d,className:e="w-full h-full object-cover",loop:f,onEnded:g,onNativeVideoError:h,title:i="Publicidad vídeo"}){let j,[k,l]=(0,c.useState)(!1);return(0,c.useEffect)(()=>{l(!1)},[a]),(j=(a||"").trim().toLowerCase())&&(j.includes("youtube.com")||j.includes("youtu.be")||j.includes("vimeo.com")||j.includes("twitch.tv")||j.includes("dailymotion.com")||j.includes("/embed/"))||k?(0,b.jsx)("iframe",{src:function(a){let b=a.trim(),c=b.toLowerCase();if(c.includes("youtube.com/watch?v=")){let a=b.split("v=")[1]?.split("&")[0];if(a)return`https://www.youtube.com/embed/${a}?autoplay=1&mute=1&loop=1&playlist=${a}&playsinline=1`}if(c.includes("youtu.be/")){let a=b.split("youtu.be/")[1]?.split("?")[0];if(a)return`https://www.youtube.com/embed/${a}?autoplay=1&mute=1&loop=1&playlist=${a}&playsinline=1`}return c.includes("youtube.com/embed/")?b.includes("?")?b:`${b}?autoplay=1&mute=1&playsinline=1`:b}(a),className:`border-0 ${e}`,allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowFullScreen:!0,title:i},d):(0,b.jsx)("video",{src:a,className:e,autoPlay:!0,muted:!0,playsInline:!0,loop:f,onEnded:g,onError:()=>{l(!0),h?.()}},d)}a.s(["CourtAdVideoOrIframe",()=>d],662248)},419780,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(346271),e=a.i(262036),f=a.i(942687);function g({tournamentId:a,className:g="",fallbackDuration:h=8}){let[i,j]=(0,c.useState)([]),[k,l]=(0,c.useState)(0),[m,n]=(0,c.useState)(!0),o=async()=>{if(a)try{let b=await f.dataService.getSponsorsByTournament(a);j(b)}catch(a){console.error("[SponsorCarousel] Error cargando sponsors:",a)}finally{n(!1)}};if((0,c.useEffect)(()=>{o();let a=setInterval(o,12e4);return()=>clearInterval(a)},[a]),(0,c.useEffect)(()=>{if(i.length<=1)return;let a=setTimeout(()=>{l(a=>(a+1)%i.length)},(i[k].duration_seconds??h)*1e3);return()=>clearTimeout(a)},[k,i,h]),m||0===i.length)return(0,b.jsx)("div",{className:`h-full w-full flex items-center justify-center bg-zinc-900/50 rounded-2xl border border-white/10 ${g}`,children:(0,b.jsx)("span",{className:"text-zinc-500 font-black uppercase tracking-widest text-sm italic",children:"Smart Padel · Sponsors"})});let p=i[k];return(0,b.jsxs)("div",{className:`relative h-full w-full overflow-hidden rounded-2xl bg-black/20 ${g}`,children:[(0,b.jsx)(e.AnimatePresence,{mode:"wait",children:(0,b.jsx)(d.motion.div,{initial:{opacity:0,x:24},animate:{opacity:1,x:0},exit:{opacity:0,x:-24},transition:{duration:.8,ease:"easeInOut"},className:"absolute inset-0 flex items-center justify-center p-4",children:(0,b.jsx)("img",{src:p.url,alt:p.name,className:"max-w-full max-h-full object-contain filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"})},p.id)}),(0,b.jsx)("div",{className:"absolute bottom-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10",children:(0,b.jsxs)("p",{className:"text-[10px] uppercase tracking-widest text-zinc-400 font-bold leading-none",children:["Official Partner:"," ",(0,b.jsx)("span",{className:"text-white",children:p.name})]})}),i.length>1&&(0,b.jsx)("div",{className:"absolute bottom-4 right-4 z-10 flex items-center gap-1",children:i.map((a,c)=>(0,b.jsx)("div",{className:"h-1.5 rounded-full transition-all duration-300",style:{width:c===k?"1rem":"0.25rem",backgroundColor:c===k?"var(--neon-color, #ccff00)":"rgba(255,255,255,0.2)"}},c))}),(0,b.jsx)("div",{className:"absolute bottom-0 left-0 w-full h-[2px] bg-white/5 overflow-hidden z-10",children:(0,b.jsx)(d.motion.div,{initial:{width:"0%"},animate:{width:"100%"},transition:{duration:p.duration_seconds??h,ease:"linear"},className:"h-full",style:{backgroundColor:"var(--neon-color, #ccff00)"}},`bar-${k}-${p.id}`)}),(0,b.jsxs)("div",{className:"absolute top-2 right-4 z-10 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5",children:[(0,b.jsx)("div",{className:"w-1.5 h-1.5 rounded-full animate-pulse",style:{backgroundColor:"var(--neon-color, #ccff00)"}}),(0,b.jsx)("span",{className:"text-[8px] font-black text-white/50 uppercase tracking-widest italic",children:"Sponsor"})]})]})}a.s(["default",()=>g])},691216,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(346271),e=a.i(262036),f=a.i(942687),g=a.i(643389),h=a.i(205277);function i(){let a=(0,g.useRouteSegment)("id"),i=(0,g.useRouteSegment)("courtId"),j=(0,c.useMemo)(()=>{let a=Number(i);return Number.isFinite(a)?a:1},[i]),[k,l]=(0,c.useState)(null),[m,n]=(0,c.useState)([]),[o,p]=(0,c.useState)(!0);(0,c.useEffect)(()=>{if(!a)return;p(!0);let b=f.dataService.subscribeToTournament(a,a=>l(a)),c=f.dataService.subscribeToMatches(a,a=>{n(a),p(!1)});return()=>{b?.(),c?.()}},[a]);let q=(0,c.useMemo)(()=>{let a=m.filter(a=>"LIVE"===String(a?.status??"").toUpperCase());return 0===a.length?null:a.find(a=>{let b;return(Number.isFinite(b=Number(a?.court??(a?.courtIndex!=null?a.courtIndex+1:null)))&&b>0?b:null)===j})||a[0]},[m,j]),r=(0,c.useMemo)(()=>{if(!k||!q)return{t1:null,t2:null};let a=q?.team1Index??q?.team1_id,b=q?.team2Index??q?.team2_id;return{t1:"number"==typeof a&&a>0&&Array.isArray(k.teams)?k.teams[a-1]:null,t2:"number"==typeof b&&b>0&&Array.isArray(k.teams)?k.teams[b-1]:null}},[k,q]),s=(0,c.useMemo)(()=>{let a=r.t1,b=r.t2,c=q?.t1Name||"ESPERANDO",d=q?.t2Name||"ACTIVO",e=a?.p1?.name||a?.p1Name||("string"==typeof c?c.split(" / ")[0]:"ESPERANDO"),f=a?.p2?.name||a?.p2Name||("string"==typeof c?c.split(" / ")[1]:"PARTIDO");return{a1:e,a2:f,b1:b?.p1?.name||b?.p1Name||("string"==typeof d?d.split(" / ")[0]:"SISTEMA"),b2:b?.p2?.name||b?.p2Name||("string"==typeof d?d.split(" / ")[1]:"ACTIVO")}},[r,q]),t=(0,c.useMemo)(()=>{let a=q?.games_sets;return Array.isArray(a)&&0!==a.length?a.map(a=>`${a?.t1??0}-${a?.t2??0}`):[]},[q]),u=(0,c.useMemo)(()=>{let a=q?.server,b=q?.serverTeam;return"A"===b||"B"===b?b:a?.team===1?"A":a?.team===2?"B":"A"},[q]),v=!q||!!q?.forcedAds,w=q?.sets?.t1??0,x=q?.sets?.t2??0,y=q?.games?.t1??0,z=q?.games?.t2??0,A=q?.points?.t1??String(q?.puntos?.local??0),B=q?.points?.t2??String(q?.puntos?.visitante??0),C=k?.name||"TORNEO SMART PADEL",D=k?.category||"Categoría Libre";return o?(0,b.jsx)("div",{className:"fixed inset-0 bg-black text-white flex items-center justify-center",children:(0,b.jsxs)(d.motion.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"text-center",children:[(0,b.jsx)("div",{className:"w-14 h-14 border-t-4 border-[#ccff00] rounded-full animate-spin mx-auto"}),(0,b.jsx)("div",{className:"mt-4 text-xs font-black uppercase tracking-[0.4em] text-gray-500",children:"Cargando TV…"})]})}):(0,b.jsx)(e.AnimatePresence,{mode:"wait",children:(0,b.jsx)(d.motion.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"fixed inset-0",children:(0,b.jsx)(h.default,{tournamentName:C,tournamentPhase:"EN VIVO",tournamentCategory:D,playerA1:s.a1,playerA2:s.a2,playerB1:s.b1,playerB2:s.b2,setsA:Number(w)||0,setsB:Number(x)||0,gamesA:Number(y)||0,gamesB:Number(z)||0,currentPointsA:A,currentPointsB:B,prevSets:t,serverTeam:u,isGoldPoint:q?.isGoldPoint,forcedAds:v,adsPlaylist:[],carouselPlaylist:[],tickerMessages:[],tournamentId:a})},`${a}_${j}_${q?.id??"none"}`)})}a.s(["default",()=>i])}];

//# sourceMappingURL=_a0a8517d._.js.map