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
            `}),(0,b.jsxs)("div",{className:`${g}-wrap ${e}`,role:"img","aria-label":"Pelota de pádel",children:[(0,b.jsx)("div",{className:`${g}-ball`}),(0,b.jsx)("div",{className:`${g}-shadow`,style:{marginTop:`${.05*a}px`}})]})]})}a.s(["BouncingBall",()=>c,"default",0,c])},643389,a=>{"use strict";var b=a.i(50944);function c(a){let c=(0,b.useParams)(),d=c?.[a];return(Array.isArray(d)?d[0]:d)??""}a.s(["useRouteSegment",()=>c])},596221,a=>{"use strict";let b=(0,a.i(170106).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);a.s(["Loader2",()=>b],596221)},808406,a=>{"use strict";let b=(0,a.i(170106).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);a.s(["Sparkles",()=>b],808406)},643472,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(346271),e=a.i(262036),f=a.i(808406);let g={inscription:"¡Epa! Firma aquí para que tu comprobante sea validado y entres al sorteo.",pro_player:"¡Estás a un paso de ser PRO! Lee esto para que juguemos bajo las reglas."},h="#CCFF00";function i({color:a}){return(0,b.jsx)("g",{"aria-hidden":!0,style:{color:a},children:Array.from({length:8}).map((a,c)=>{let d=c/8*Math.PI*2,e=20+14*Math.cos(d),f=12+14*Math.sin(d);return(0,b.jsx)("line",{x1:20,y1:12,x2:e,y2:f,stroke:"currentColor",strokeWidth:1.2,strokeLinecap:"round",opacity:.45},c)})})}function j(){return(0,b.jsx)("rect",{x:1,y:1,width:38,height:38,rx:10,fill:"none",stroke:"#7dd3fc",strokeWidth:1.25,opacity:.85,style:{filter:"drop-shadow(0 0 3px rgba(125,211,252,0.5))"}})}function k({stroke:a,opacity:c=.92}){return(0,b.jsxs)("g",{fill:"none",stroke:a,strokeWidth:1.15,strokeLinecap:"round",opacity:c,children:[(0,b.jsx)("path",{d:"M 10 22 Q 20 16 30 22"}),(0,b.jsx)("path",{d:"M 10 24 Q 20 30 30 24"})]})}function l({config:a,idle:c,celebrate:e,thinking:f,xEyes:g,gradientId:l}){let m="buchanans_pro"===a.premiumPartner,n=m?h:a.eyeColor??"#CCFF00",o=new Set(a.specialAccessories??[]),p=m?`url(#${l})`:a.bodyColor,q=c&&!e,r=f&&!e;return(0,b.jsxs)(d.motion.svg,{viewBox:"0 0 40 40",className:"h-9 w-9 shrink-0 overflow-visible","aria-hidden":!0,animate:q?{y:[0,-2.2,0,-1.2,0]}:{y:0},transition:{duration:4.2,repeat:q?1/0:0,ease:"easeInOut"},children:[m&&(0,b.jsx)("defs",{children:(0,b.jsxs)("linearGradient",{id:l,x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[(0,b.jsx)("stop",{offset:"0%",stopColor:"#004D40"}),(0,b.jsx)("stop",{offset:"100%",stopColor:"#00695C"})]})}),o.has("sun-rays")&&(0,b.jsx)(i,{color:n}),o.has("ice-frame")&&(0,b.jsx)(j,{}),(0,b.jsx)("rect",{x:6,y:10,width:28,height:24,rx:9,ry:9,fill:p,stroke:m?"rgba(201,162,39,0.35)":"rgba(255,255,255,0.18)",strokeWidth:m?1.2:1}),m&&(0,b.jsx)(k,{stroke:"#B71C1C"}),(0,b.jsx)(d.motion.g,{animate:r?{x:[0,.7,0,-.4,0]}:q?{x:[0,1.5,0,-1.5,0]}:{x:0},transition:{duration:5.6,repeat:q||r?1/0:0,ease:"easeInOut"},children:(0,b.jsx)(d.motion.g,{style:{transformOrigin:"20px 19px"},animate:r?{scaleY:[1,.78,.96,.78,1],x:[0,.6,0]}:q?{scaleY:[1,1,.1,1,1],x:0}:{scaleY:1,x:0},transition:{duration:r?1.6:3.4,repeat:q||r?1/0:0,ease:"easeInOut",times:r?void 0:[0,.86,.9,.94,1]},children:g&&!e?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(d.motion.path,{d:"M 12.2 18.2 L 17.8 23.8",stroke:n,strokeWidth:1.9,strokeLinecap:"round",animate:{opacity:[1,.65,1],rotate:[0,-10,0]},transition:{duration:.8,repeat:1/0,ease:"easeInOut"}}),(0,b.jsx)(d.motion.path,{d:"M 17.8 18.2 L 12.2 23.8",stroke:n,strokeWidth:1.9,strokeLinecap:"round",animate:{opacity:[1,.65,1],rotate:[0,10,0]},transition:{duration:.8,repeat:1/0,ease:"easeInOut"}}),(0,b.jsx)(d.motion.path,{d:"M 22.2 18.2 L 27.8 23.8",stroke:n,strokeWidth:1.9,strokeLinecap:"round",animate:{opacity:[1,.65,1],rotate:[0,10,0]},transition:{duration:.8,repeat:1/0,ease:"easeInOut"}}),(0,b.jsx)(d.motion.path,{d:"M 27.8 18.2 L 22.2 23.8",stroke:n,strokeWidth:1.9,strokeLinecap:"round",animate:{opacity:[1,.65,1],rotate:[0,-10,0]},transition:{duration:.8,repeat:1/0,ease:"easeInOut"}})]}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("circle",{cx:14,cy:19,r:3.2,fill:n,style:{filter:"drop-shadow(0 0 2px currentColor)"}}),(0,b.jsx)("circle",{cx:26,cy:19,r:3.2,fill:n,style:{filter:"drop-shadow(0 0 2px currentColor)"}}),(0,b.jsx)("circle",{cx:13.2,cy:18.2,r:.9,fill:"rgba(255,255,255,0.85)"}),(0,b.jsx)("circle",{cx:25.2,cy:18.2,r:.9,fill:"rgba(255,255,255,0.85)"})]})})}),!m&&(0,b.jsx)("image",{href:a.logoUrl,x:9,y:24,width:22,height:11,preserveAspectRatio:"xMidYMid meet"}),(0,b.jsx)("path",{d:"M 14 29 Q 20 33 26 29",fill:"none",stroke:m?"rgba(0,0,0,0.45)":"rgba(0,0,0,0.35)",strokeWidth:1.2,strokeLinecap:"round"})]})}function m({href:a}){return(0,b.jsx)(d.motion.div,{className:"pointer-events-none absolute -bottom-1 -left-1 z-20 h-11 w-11 sm:h-12 sm:w-12",initial:!1,animate:{y:[0,-4,0,-2,0],rotate:[0,-2,0,2,0]},transition:{duration:5,repeat:1/0,ease:"easeInOut"},style:{filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.5)) drop-shadow(0 0 6px rgba(201,162,39,0.35))"},children:(0,b.jsx)("img",{src:a,alt:"",className:"h-full w-full object-contain",loading:"lazy",decoding:"async"})})}function n({type:a,celebrate:i=!1,message:j,sponsorConfig:k,idle:n,thinking:o=!1,xEyes:p=!1,className:q=""}){let r=(0,c.useId)().replace(/:/g,""),s=`bp-body-${r}`,t=j?.trim()?j.trim():a?g[a]:"Smart Padel",u=k?.premiumPartner==="buchanans_pro",v=u?h:k?.eyeColor??"#CCFF00",w=!1!==n&&!!k,x=(0,c.useMemo)(()=>u?{borderColor:"#c9a227",backgroundColor:"rgba(0, 20, 18, 0.88)",boxShadow:`
              0 0 0 1px rgba(201, 162, 39, 0.55),
              0 0 0 2px rgba(0, 77, 64, 0.5),
              0 0 24px rgba(0, 105, 92, 0.55),
              0 0 48px rgba(0, 77, 64, 0.35),
              inset 0 1px 0 rgba(201, 162, 39, 0.25),
              inset 0 -12px 28px rgba(0, 0, 0, 0.45)
            `.replace(/\s+/g," ").trim()}:{borderColor:`${v}66`,backgroundColor:"rgba(0,0,0,0.82)",boxShadow:"0 8px 32px rgba(0,0,0,0.45)"},[u,v]);return(0,b.jsxs)("div",{className:`pointer-events-none absolute right-2 top-2 z-30 flex max-w-[min(220px,55vw)] flex-col items-end gap-1 sm:right-3 sm:top-3 ${q}`,children:[(0,b.jsx)(e.AnimatePresence,{children:i&&(0,b.jsx)(d.motion.div,{initial:{opacity:0,scale:.5},animate:{opacity:1,scale:1},exit:{opacity:0},className:"mb-1 flex flex-wrap justify-end gap-0.5",children:Array.from({length:10}).map((a,c)=>(0,b.jsx)(d.motion.span,{className:"h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]",style:{backgroundColor:v,color:v},initial:{opacity:1,y:0,x:0},animate:{opacity:0,y:-28-18*Math.random(),x:(c-5)*10+(8*Math.random()-4)},transition:{duration:.75,ease:"easeOut"}},c))})}),(0,b.jsxs)(d.motion.div,{className:`relative flex items-center gap-2 rounded-2xl border-2 px-2.5 py-2 backdrop-blur-md ${u?"ring-1 ring-amber-500/30 pl-11 sm:pl-12":""}`,style:x,animate:i?{scale:[1,1.06,1],rotate:[0,-2,2,0]}:u&&w?{scale:[1,1.012,1]}:{scale:1},transition:i?{duration:.45}:u&&w?{duration:3.5,repeat:1/0,ease:"easeInOut"}:{duration:.2},children:[u&&k.logoUrl?(0,b.jsx)(m,{href:k.logoUrl}):null,k?(0,b.jsx)(d.motion.div,{className:"relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-black/30",style:{borderColor:v,boxShadow:`0 0 0 0 ${v}80`},animate:i?{boxShadow:[`0 0 0 0 ${v}80`,`0 0 0 12px ${v}00`]}:{boxShadow:"0 0 0 0 transparent"},transition:{duration:.6,repeat:2*!!i},children:(0,b.jsx)(l,{config:k,idle:w,celebrate:i,thinking:o,xEyes:p,gradientId:s})}):(0,b.jsx)(d.motion.div,{className:"relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#ccff00] bg-[#ccff00]/15",animate:i?{boxShadow:["0 0 0 0 rgba(204,255,0,0.5)","0 0 0 12px rgba(204,255,0,0)"]}:{},transition:{duration:.6,repeat:2*!!i},children:(0,b.jsx)(f.Sparkles,{className:"h-4 w-4 text-[#ccff00]",strokeWidth:2.2})}),(0,b.jsx)("p",{className:"pointer-events-auto relative z-10 pl-1 text-left text-[10px] font-semibold leading-snug tracking-tight text-zinc-200 sm:text-[11px]",children:t})]})]})}a.s(["PuntitoIA",()=>n])},762299,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(50944),e=a.i(643389),f=a.i(338393),g=a.i(515358),h=a.i(849708),i=a.i(357374),j=a.i(643472),k=a.i(167453),l=a.i(596221);function m(){let a=(0,e.useRouteSegment)("id"),m=(0,d.useRouter)(),{user:o,loading:p}=(0,f.useAuth)(),{clubRif:q,clubBank:r,clubPhone:s,clubName:t}=(0,g.useAppSettings)(),[u,v]=(0,c.useState)(""),[w,x]=(0,c.useState)(""),[y,z]=(0,c.useState)(""),[A,B]=(0,c.useState)(null),[C,D]=(0,c.useState)(!1),[E,F]=(0,c.useState)(!1);(0,c.useEffect)(()=>{p||o||m.replace(`/login?from=/tournaments/${a}/inscribirme/pago`)},[p,o,m,a]);let G=E||C;return(0,b.jsxs)("div",{className:"relative min-h-dvh bg-[#080808] text-white font-outfit overflow-hidden",children:[p&&(0,b.jsx)("div",{className:"absolute inset-0 flex items-center justify-center bg-[#080808]",children:(0,b.jsx)(i.default,{size:40,bounceHeight:2})}),!p&&o&&(0,b.jsxs)("div",{className:"relative z-10 mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14",children:[(0,b.jsxs)("div",{className:"mb-6 flex items-center justify-between gap-3",children:[(0,b.jsx)("button",{type:"button",onClick:()=>m.back(),className:"text-[12px] font-black uppercase tracking-widest text-white/70 hover:text-white",children:"Atrás"}),(0,b.jsxs)("div",{className:"text-center",children:[(0,b.jsx)("p",{className:"text-[10px] font-black uppercase tracking-widest text-[#ccff00]/80",children:"Smart Padel"}),(0,b.jsx)("h1",{className:"text-lg sm:text-xl font-black uppercase italic tracking-tighter",children:"Reporte de Pago Móvil"})]}),(0,b.jsx)("div",{className:"w-16","aria-hidden":!0})]}),(0,b.jsxs)("div",{className:"relative rounded-[2.2rem] border border-[#ccff00]/25 bg-[#050505] shadow-[0_0_40px_rgba(204,255,0,0.10)] overflow-hidden",children:[(0,b.jsx)("div",{className:"pointer-events-none absolute inset-0 opacity-[0.06] bg-gradient-to-br from-[#ccff00] via-transparent to-[#1f2a00]"}),(0,b.jsxs)("div",{className:"relative p-6 sm:p-8",children:[E&&(0,b.jsx)(j.PuntitoIA,{type:"inscription",thinking:!0,idle:!0,message:"Procesando tu reporte…",sponsorConfig:{bodyColor:"rgba(0,0,0,0.82)",logoUrl:"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='22'><rect width='44' height='22' fill='none'/></svg>",eyeColor:"#CCFF00"},className:"right-3 top-3"}),(0,b.jsxs)("div",{className:"mb-7 rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5",children:[(0,b.jsxs)("div",{className:"flex items-start justify-between gap-3",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-[10px] font-black uppercase tracking-widest text-[#ccff00]/80",children:"Datos del club"}),(0,b.jsx)("p",{className:"mt-1 text-sm font-bold",children:t||"Smart Padel"})]}),(0,b.jsxs)("div",{className:"text-right",children:[(0,b.jsx)("p",{className:"text-[10px] font-black uppercase tracking-widest text-white/50",children:"RIF"}),(0,b.jsx)("p",{className:"text-sm font-bold",children:q||"—"})]})]}),(0,b.jsxs)("div",{className:"mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-[10px] font-black uppercase tracking-widest text-white/50",children:"Banco destino"}),(0,b.jsx)("p",{className:"text-sm font-bold",children:r||"—"})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"text-[10px] font-black uppercase tracking-widest text-white/50",children:"Teléfono"}),(0,b.jsx)("p",{className:"text-sm font-bold",children:s||"—"})]})]})]}),C?(0,b.jsxs)("div",{className:"text-center space-y-4",children:[(0,b.jsx)(k.CheckCircle2,{className:"w-14 h-14 mx-auto text-[#ccff00]"}),(0,b.jsx)("h2",{className:"text-xl font-black uppercase italic",children:"Reporte enviado"}),(0,b.jsx)("p",{className:"text-sm text-white/60",children:"Quedaste en cola de validación. Revisa tu inscripción cuando el admin apruebe el pago."}),(0,b.jsx)("button",{type:"button",onClick:()=>m.push(`/tournaments/${a}/inscribirme`),className:"mt-2 inline-flex items-center justify-center rounded-2xl bg-[#ccff00] text-black font-black uppercase italic tracking-widest px-6 py-3",children:"Volver a inscribirme"})]}):(0,b.jsx)(b.Fragment,{children:(0,b.jsx)("form",{onSubmit:async b=>{b.preventDefault(),B(null);let c=y.replace(/\D+/g,"");if(!/^\d{4,8}$/.test(c))return void B("La referencia debe tener 4-8 dígitos.");if(!u.trim())return void B("Indica el Banco de Origen.");if(!w.trim())return void B("Indica el Teléfono emisor.");F(!0);try{let b=await (0,h.getAuthHeaders)(),d=await fetch(`/api/tournaments/${a}/inscribirme/pago`,{method:"POST",headers:{...b,"Content-Type":"application/json"},body:JSON.stringify({bankOrigin:u.trim(),phoneEmitter:w.trim(),referenceNumber:c})}),e=await d.json().catch(()=>({}));if(!d.ok)return void B(e?.error||"No se pudo enviar el reporte.");D(!0)}catch(a){B(a?.message||"Error de red.")}finally{F(!1)}},children:(0,b.jsxs)("div",{className:"space-y-5",children:[(0,b.jsx)(n,{label:"Banco de Origen",hint:"El banco del emisor (tu banco).",value:u,onChange:v,placeholder:"Ej.: Banco de Venezuela"}),(0,b.jsx)(n,{label:"Teléfono emisor",hint:"Un número para que el club pueda contactarte.",value:w,onChange:x,placeholder:"Ej.: 0412 123 4567"}),(0,b.jsx)(n,{label:"Número de Referencia",hint:"4-8 dígitos (tal cual aparece en el comprobante).",value:y,onChange:z,placeholder:"Ej.: 123456",inputMode:"numeric"}),A&&(0,b.jsx)("div",{className:"rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 font-bold",children:A}),(0,b.jsx)("button",{type:"submit",disabled:G,className:"w-full rounded-2xl border border-[#ccff00]/30 bg-[#ccff00] text-black font-black uppercase italic tracking-widest py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_28px_rgba(204,255,0,0.22)]",children:E?(0,b.jsxs)("span",{className:"inline-flex items-center justify-center gap-2",children:[(0,b.jsx)(l.Loader2,{className:"w-5 h-5 animate-spin"}),"Enviando…"]}):"Enviar reporte"}),(0,b.jsxs)("p",{className:"text-center text-[11px] text-white/50 leading-relaxed",children:["Tu reporte quedará en ",(0,b.jsx)("span",{className:"text-[#ccff00] font-black",children:"pending"})," para que el admin lo valide en"," ",(0,b.jsx)("span",{className:"text-white/70 font-bold",children:"/admin/validacion-pagos"}),"."]})]})})})]})]})]})]})}function n({label:a,hint:c,value:d,onChange:e,placeholder:f,inputMode:g}){return(0,b.jsxs)("div",{children:[(0,b.jsxs)("div",{className:"flex items-baseline justify-between gap-3 mb-2",children:[(0,b.jsx)("label",{className:"text-[10px] font-black uppercase tracking-widest text-white/50",children:a}),c&&(0,b.jsx)("span",{className:"text-[10px] text-white/40 font-bold",children:c})]}),(0,b.jsx)("input",{type:"text",inputMode:g,value:d,onChange:a=>e(a.target.value),placeholder:f,className:"w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-5 py-4 outline-none text-white font-bold placeholder:text-white/30 focus:border-[#ccff00]/60 shadow-[0_0_0_rgba(204,255,0,0.0)]"})]})}a.s(["default",()=>m])}];

//# sourceMappingURL=_49501e9d._.js.map