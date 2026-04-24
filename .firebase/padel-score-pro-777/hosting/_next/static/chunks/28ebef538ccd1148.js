(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,917400,e=>{"use strict";var t=e.i(843476);function a({size:e=36,duration:a=700,bounceHeight:r=2.2,className:s=""}){let i=e*r,n=`bb-${e}-${a}`;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:`
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
            `}),(0,t.jsxs)("div",{className:`${n}-wrap ${s}`,role:"img","aria-label":"Pelota de pádel",children:[(0,t.jsx)("div",{className:`${n}-ball`}),(0,t.jsx)("div",{className:`${n}-shadow`,style:{marginTop:`${.05*e}px`}})]})]})}e.s(["BouncingBall",()=>a,"default",0,a])},199267,e=>{"use strict";var t=e.i(618566);function a(e){let a=(0,t.useParams)(),r=a?.[e];return(Array.isArray(r)?r[0]:r)??""}e.s(["useRouteSegment",()=>a])},531278,e=>{"use strict";let t=(0,e.i(475254).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);e.s(["Loader2",()=>t],531278)},283086,e=>{"use strict";let t=(0,e.i(475254).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);e.s(["Sparkles",()=>t],283086)},112181,e=>{"use strict";var t=e.i(843476),a=e.i(271645),r=e.i(846932),s=e.i(88653),i=e.i(283086);let n={inscription:"¡Epa! Firma aquí para que tu comprobante sea validado y entres al sorteo.",pro_player:"¡Estás a un paso de ser PRO! Lee esto para que juguemos bajo las reglas."},o="#CCFF00";function l({color:e}){return(0,t.jsx)("g",{"aria-hidden":!0,style:{color:e},children:Array.from({length:8}).map((e,a)=>{let r=a/8*Math.PI*2,s=20+14*Math.cos(r),i=12+14*Math.sin(r);return(0,t.jsx)("line",{x1:20,y1:12,x2:s,y2:i,stroke:"currentColor",strokeWidth:1.2,strokeLinecap:"round",opacity:.45},a)})})}function c(){return(0,t.jsx)("rect",{x:1,y:1,width:38,height:38,rx:10,fill:"none",stroke:"#7dd3fc",strokeWidth:1.25,opacity:.85,style:{filter:"drop-shadow(0 0 3px rgba(125,211,252,0.5))"}})}function d({stroke:e,opacity:a=.92}){return(0,t.jsxs)("g",{fill:"none",stroke:e,strokeWidth:1.15,strokeLinecap:"round",opacity:a,children:[(0,t.jsx)("path",{d:"M 10 22 Q 20 16 30 22"}),(0,t.jsx)("path",{d:"M 10 24 Q 20 30 30 24"})]})}function p({config:e,idle:a,celebrate:s,thinking:i,xEyes:n,gradientId:p}){let x="buchanans_pro"===e.premiumPartner,m=x?o:e.eyeColor??"#CCFF00",h=new Set(e.specialAccessories??[]),u=x?`url(#${p})`:e.bodyColor,b=a&&!s,f=i&&!s;return(0,t.jsxs)(r.motion.svg,{viewBox:"0 0 40 40",className:"h-9 w-9 shrink-0 overflow-visible","aria-hidden":!0,animate:b?{y:[0,-2.2,0,-1.2,0]}:{y:0},transition:{duration:4.2,repeat:b?1/0:0,ease:"easeInOut"},children:[x&&(0,t.jsx)("defs",{children:(0,t.jsxs)("linearGradient",{id:p,x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[(0,t.jsx)("stop",{offset:"0%",stopColor:"#004D40"}),(0,t.jsx)("stop",{offset:"100%",stopColor:"#00695C"})]})}),h.has("sun-rays")&&(0,t.jsx)(l,{color:m}),h.has("ice-frame")&&(0,t.jsx)(c,{}),(0,t.jsx)("rect",{x:6,y:10,width:28,height:24,rx:9,ry:9,fill:u,stroke:x?"rgba(201,162,39,0.35)":"rgba(255,255,255,0.18)",strokeWidth:x?1.2:1}),x&&(0,t.jsx)(d,{stroke:"#B71C1C"}),(0,t.jsx)(r.motion.g,{animate:f?{x:[0,.7,0,-.4,0]}:b?{x:[0,1.5,0,-1.5,0]}:{x:0},transition:{duration:5.6,repeat:b||f?1/0:0,ease:"easeInOut"},children:(0,t.jsx)(r.motion.g,{style:{transformOrigin:"20px 19px"},animate:f?{scaleY:[1,.78,.96,.78,1],x:[0,.6,0]}:b?{scaleY:[1,1,.1,1,1],x:0}:{scaleY:1,x:0},transition:{duration:f?1.6:3.4,repeat:b||f?1/0:0,ease:"easeInOut",times:f?void 0:[0,.86,.9,.94,1]},children:n&&!s?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(r.motion.path,{d:"M 12.2 18.2 L 17.8 23.8",stroke:m,strokeWidth:1.9,strokeLinecap:"round",animate:{opacity:[1,.65,1],rotate:[0,-10,0]},transition:{duration:.8,repeat:1/0,ease:"easeInOut"}}),(0,t.jsx)(r.motion.path,{d:"M 17.8 18.2 L 12.2 23.8",stroke:m,strokeWidth:1.9,strokeLinecap:"round",animate:{opacity:[1,.65,1],rotate:[0,10,0]},transition:{duration:.8,repeat:1/0,ease:"easeInOut"}}),(0,t.jsx)(r.motion.path,{d:"M 22.2 18.2 L 27.8 23.8",stroke:m,strokeWidth:1.9,strokeLinecap:"round",animate:{opacity:[1,.65,1],rotate:[0,10,0]},transition:{duration:.8,repeat:1/0,ease:"easeInOut"}}),(0,t.jsx)(r.motion.path,{d:"M 27.8 18.2 L 22.2 23.8",stroke:m,strokeWidth:1.9,strokeLinecap:"round",animate:{opacity:[1,.65,1],rotate:[0,-10,0]},transition:{duration:.8,repeat:1/0,ease:"easeInOut"}})]}):(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("circle",{cx:14,cy:19,r:3.2,fill:m,style:{filter:"drop-shadow(0 0 2px currentColor)"}}),(0,t.jsx)("circle",{cx:26,cy:19,r:3.2,fill:m,style:{filter:"drop-shadow(0 0 2px currentColor)"}}),(0,t.jsx)("circle",{cx:13.2,cy:18.2,r:.9,fill:"rgba(255,255,255,0.85)"}),(0,t.jsx)("circle",{cx:25.2,cy:18.2,r:.9,fill:"rgba(255,255,255,0.85)"})]})})}),!x&&(0,t.jsx)("image",{href:e.logoUrl,x:9,y:24,width:22,height:11,preserveAspectRatio:"xMidYMid meet"}),(0,t.jsx)("path",{d:"M 14 29 Q 20 33 26 29",fill:"none",stroke:x?"rgba(0,0,0,0.45)":"rgba(0,0,0,0.35)",strokeWidth:1.2,strokeLinecap:"round"})]})}function x({href:e}){return(0,t.jsx)(r.motion.div,{className:"pointer-events-none absolute -bottom-1 -left-1 z-20 h-11 w-11 sm:h-12 sm:w-12",initial:!1,animate:{y:[0,-4,0,-2,0],rotate:[0,-2,0,2,0]},transition:{duration:5,repeat:1/0,ease:"easeInOut"},style:{filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(201,162,39,0.35))"},children:(0,t.jsx)("img",{src:e,alt:"",className:"h-full w-full object-contain",loading:"lazy",decoding:"async"})})}function m({type:e,celebrate:l=!1,message:c,sponsorConfig:d,idle:m,thinking:h=!1,xEyes:u=!1,className:b=""}){let f=(0,a.useId)().replace(/:/g,""),g=`bp-body-${f}`,j=c?.trim()?c.trim():e?n[e]:"Smart Padel",y=d?.premiumPartner==="buchanans_pro",w=y?o:d?.eyeColor??"#CCFF00",v=!1!==m&&!!d,k=(0,a.useMemo)(()=>y?{borderColor:"#c9a227",backgroundColor:"rgba(0, 20, 18, 0.88)",boxShadow:`
              0 0 0 1px rgba(201, 162, 39, 0.55),
              0 0 0 2px rgba(0, 77, 64, 0.5),
              0 0 24px rgba(0, 105, 92, 0.55),
              0 0 48px rgba(0, 77, 64, 0.35),
              inset 0 1px 0 rgba(201, 162, 39, 0.25),
              inset 0 -12px 28px rgba(0, 0, 0, 0.45)
            `.replace(/\s+/g," ").trim()}:{borderColor:`${w}66`,backgroundColor:"rgba(0,0,0,0.82)",boxShadow:"0 8px 32px rgba(0,0,0,0.45)"},[y,w]);return(0,t.jsxs)("div",{className:`pointer-events-none absolute right-2 top-2 z-30 flex max-w-[min(220px,55vw)] flex-col items-end gap-1 sm:right-3 sm:top-3 ${b}`,children:[(0,t.jsx)(s.AnimatePresence,{children:l&&(0,t.jsx)(r.motion.div,{initial:{opacity:0,scale:.5},animate:{opacity:1,scale:1},exit:{opacity:0},className:"mb-1 flex flex-wrap justify-end gap-0.5",children:Array.from({length:10}).map((e,a)=>(0,t.jsx)(r.motion.span,{className:"h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]",style:{backgroundColor:w,color:w},initial:{opacity:1,y:0,x:0},animate:{opacity:0,y:-28-18*Math.random(),x:(a-5)*10+(8*Math.random()-4)},transition:{duration:.75,ease:"easeOut"}},a))})}),(0,t.jsxs)(r.motion.div,{className:`relative flex items-center gap-2 rounded-2xl border-2 px-2.5 py-2 backdrop-blur-md ${y?"ring-1 ring-amber-500/30 pl-11 sm:pl-12":""}`,style:k,animate:l?{scale:[1,1.06,1],rotate:[0,-2,2,0]}:y&&v?{scale:[1,1.012,1]}:{scale:1},transition:l?{duration:.45}:y&&v?{duration:3.5,repeat:1/0,ease:"easeInOut"}:{duration:.2},children:[y&&d.logoUrl?(0,t.jsx)(x,{href:d.logoUrl}):null,d?(0,t.jsx)(r.motion.div,{className:"relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-black/30",style:{borderColor:w,boxShadow:`0 0 0 0 ${w}80`},animate:l?{boxShadow:[`0 0 0 0 ${w}80`,`0 0 0 12px ${w}00`]}:{boxShadow:"0 0 0 0 transparent"},transition:{duration:.6,repeat:2*!!l},children:(0,t.jsx)(p,{config:d,idle:v,celebrate:l,thinking:h,xEyes:u,gradientId:g})}):(0,t.jsx)(r.motion.div,{className:"relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#ccff00] bg-[#ccff00]/15",animate:l?{boxShadow:["0 0 0 0 rgba(204,255,0,0.5)","0 0 0 12px rgba(204,255,0,0)"]}:{},transition:{duration:.6,repeat:2*!!l},children:(0,t.jsx)(i.Sparkles,{className:"h-4 w-4 text-[#ccff00]",strokeWidth:2.2})}),(0,t.jsx)("p",{className:"pointer-events-auto relative z-10 pl-1 text-left text-[10px] font-semibold leading-snug tracking-tight text-zinc-200 sm:text-[11px]",children:j})]})]})}e.s(["PuntitoIA",()=>m])},16798,e=>{"use strict";var t=e.i(843476),a=e.i(271645),r=e.i(618566),s=e.i(199267),i=e.i(85205),n=e.i(257166),o=e.i(794398),l=e.i(917400),c=e.i(112181),d=e.i(595468),p=e.i(531278);function x(){let e=(0,s.useRouteSegment)("id"),x=(0,r.useRouter)(),{user:h,loading:u}=(0,i.useAuth)(),{clubRif:b,clubBank:f,clubPhone:g,clubName:j}=(0,n.useAppSettings)(),[y,w]=(0,a.useState)(""),[v,k]=(0,a.useState)(""),[N,$]=(0,a.useState)(""),[C,S]=(0,a.useState)(null),[M,O]=(0,a.useState)(!1),[A,P]=(0,a.useState)(!1);(0,a.useEffect)(()=>{u||h||x.replace(`/login?from=/tournaments/${e}/inscribirme/pago`)},[u,h,x,e]);let E=A||M;return(0,t.jsxs)("div",{className:"relative min-h-dvh bg-[#080808] text-white font-outfit overflow-hidden",children:[u&&(0,t.jsx)("div",{className:"absolute inset-0 flex items-center justify-center bg-[#080808]",children:(0,t.jsx)(l.default,{size:40,bounceHeight:2})}),!u&&h&&(0,t.jsxs)("div",{className:"relative z-10 mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14",children:[(0,t.jsxs)("div",{className:"mb-6 flex items-center justify-between gap-3",children:[(0,t.jsx)("button",{type:"button",onClick:()=>x.back(),className:"text-[12px] font-black uppercase tracking-widest text-white/70 hover:text-white",children:"Atrás"}),(0,t.jsxs)("div",{className:"text-center",children:[(0,t.jsx)("p",{className:"text-[10px] font-black uppercase tracking-widest text-[#ccff00]/80",children:"Smart Padel"}),(0,t.jsx)("h1",{className:"text-lg sm:text-xl font-black uppercase italic tracking-tighter",children:"Reporte de Pago Móvil"})]}),(0,t.jsx)("div",{className:"w-16","aria-hidden":!0})]}),(0,t.jsxs)("div",{className:"relative rounded-[2.2rem] border border-[#ccff00]/25 bg-[#050505] shadow-[0_0_40px_rgba(204,255,0,0.10)] overflow-hidden",children:[(0,t.jsx)("div",{className:"pointer-events-none absolute inset-0 opacity-[0.06] bg-gradient-to-br from-[#ccff00] via-transparent to-[#1f2a00]"}),(0,t.jsxs)("div",{className:"relative p-6 sm:p-8",children:[A&&(0,t.jsx)(c.PuntitoIA,{type:"inscription",thinking:!0,idle:!0,message:"Procesando tu reporte…",sponsorConfig:{bodyColor:"rgba(0,0,0,0.82)",logoUrl:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='22'><rect width='44' height='22' fill='none'/></svg>",eyeColor:"#CCFF00"},className:"right-3 top-3"}),(0,t.jsxs)("div",{className:"mb-7 rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5",children:[(0,t.jsxs)("div",{className:"flex items-start justify-between gap-3",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-[10px] font-black uppercase tracking-widest text-[#ccff00]/80",children:"Datos del club"}),(0,t.jsx)("p",{className:"mt-1 text-sm font-bold",children:j||"Smart Padel"})]}),(0,t.jsxs)("div",{className:"text-right",children:[(0,t.jsx)("p",{className:"text-[10px] font-black uppercase tracking-widest text-white/50",children:"RIF"}),(0,t.jsx)("p",{className:"text-sm font-bold",children:b||"—"})]})]}),(0,t.jsxs)("div",{className:"mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-[10px] font-black uppercase tracking-widest text-white/50",children:"Banco destino"}),(0,t.jsx)("p",{className:"text-sm font-bold",children:f||"—"})]}),(0,t.jsxs)("div",{children:[(0,t.jsx)("p",{className:"text-[10px] font-black uppercase tracking-widest text-white/50",children:"Teléfono"}),(0,t.jsx)("p",{className:"text-sm font-bold",children:g||"—"})]})]})]}),M?(0,t.jsxs)("div",{className:"text-center space-y-4",children:[(0,t.jsx)(d.CheckCircle2,{className:"w-14 h-14 mx-auto text-[#ccff00]"}),(0,t.jsx)("h2",{className:"text-xl font-black uppercase italic",children:"Reporte enviado"}),(0,t.jsx)("p",{className:"text-sm text-white/60",children:"Quedaste en cola de validación. Revisa tu inscripción cuando el admin apruebe el pago."}),(0,t.jsx)("button",{type:"button",onClick:()=>x.push(`/tournaments/${e}/inscribirme`),className:"mt-2 inline-flex items-center justify-center rounded-2xl bg-[#ccff00] text-black font-black uppercase italic tracking-widest px-6 py-3",children:"Volver a inscribirme"})]}):(0,t.jsx)(t.Fragment,{children:(0,t.jsx)("form",{onSubmit:async t=>{t.preventDefault(),S(null);let a=N.replace(/\D+/g,"");if(!/^\d{4,8}$/.test(a))return void S("La referencia debe tener 4-8 dígitos.");if(!y.trim())return void S("Indica el Banco de Origen.");if(!v.trim())return void S("Indica el Teléfono emisor.");P(!0);try{let t=await (0,o.getAuthHeaders)(),r=await fetch(`/api/tournaments/${e}/inscribirme/pago`,{method:"POST",headers:{...t,"Content-Type":"application/json"},body:JSON.stringify({bankOrigin:y.trim(),phoneEmitter:v.trim(),referenceNumber:a})}),s=await r.json().catch(()=>({}));if(!r.ok)return void S(s?.error||"No se pudo enviar el reporte.");O(!0)}catch(e){S(e?.message||"Error de red.")}finally{P(!1)}},children:(0,t.jsxs)("div",{className:"space-y-5",children:[(0,t.jsx)(m,{label:"Banco de Origen",hint:"El banco del emisor (tu banco).",value:y,onChange:w,placeholder:"Ej.: Banco de Venezuela"}),(0,t.jsx)(m,{label:"Teléfono emisor",hint:"Un número para que el club pueda contactarte.",value:v,onChange:k,placeholder:"Ej.: 0412 123 4567"}),(0,t.jsx)(m,{label:"Número de Referencia",hint:"4-8 dígitos (tal cual aparece en el comprobante).",value:N,onChange:$,placeholder:"Ej.: 123456",inputMode:"numeric"}),C&&(0,t.jsx)("div",{className:"rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 font-bold",children:C}),(0,t.jsx)("button",{type:"submit",disabled:E,className:"w-full rounded-2xl border border-[#ccff00]/30 bg-[#ccff00] text-black font-black uppercase italic tracking-widest py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_28px_rgba(204,255,0,0.22)]",children:A?(0,t.jsxs)("span",{className:"inline-flex items-center justify-center gap-2",children:[(0,t.jsx)(p.Loader2,{className:"w-5 h-5 animate-spin"}),"Enviando…"]}):"Enviar reporte"}),(0,t.jsxs)("p",{className:"text-center text-[11px] text-white/50 leading-relaxed",children:["Tu reporte quedará en ",(0,t.jsx)("span",{className:"text-[#ccff00] font-black",children:"pending"})," para que el admin lo valide en"," ",(0,t.jsx)("span",{className:"text-white/70 font-bold",children:"/admin/validacion-pagos"}),"."]})]})})})]})]})]})]})}function m({label:e,hint:a,value:r,onChange:s,placeholder:i,inputMode:n}){return(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"flex items-baseline justify-between gap-3 mb-2",children:[(0,t.jsx)("label",{className:"text-[10px] font-black uppercase tracking-widest text-white/50",children:e}),a&&(0,t.jsx)("span",{className:"text-[10px] text-white/40 font-bold",children:a})]}),(0,t.jsx)("input",{type:"text",inputMode:n,value:r,onChange:e=>s(e.target.value),placeholder:i,className:"w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-5 py-4 outline-none text-white font-bold placeholder:text-white/30 focus:border-[#ccff00]/60 shadow-[0_0_0_rgba(204,255,0,0.0)]"})]})}e.s(["default",()=>x])}]);