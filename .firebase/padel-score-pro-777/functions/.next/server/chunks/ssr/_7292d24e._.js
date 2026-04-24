module.exports=[669520,a=>{"use strict";let b=(0,a.i(170106).default)("refresh-cw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);a.s(["RefreshCw",()=>b],669520)},357374,a=>{"use strict";var b=a.i(187924);function c({size:a=36,duration:c=700,bounceHeight:d=2.2,className:e=""}){let f=a*d,g=`bb-${a}-${c}`;return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("style",{children:`
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
            `}),(0,b.jsxs)("div",{className:`${g}-wrap ${e}`,role:"img","aria-label":"Pelota de pádel",children:[(0,b.jsx)("div",{className:`${g}-ball`}),(0,b.jsx)("div",{className:`${g}-shadow`,style:{marginTop:`${.05*a}px`}})]})]})}a.s(["BouncingBall",()=>c,"default",0,c])},546842,a=>{"use strict";let b=(0,a.i(170106).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);a.s(["User",()=>b],546842)},501027,a=>{"use strict";let b=(0,a.i(170106).default)("zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);a.s(["Zap",()=>b],501027)},292e3,a=>{"use strict";let b=(0,a.i(170106).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);a.s(["AlertCircle",()=>b],292e3)},533441,a=>{"use strict";let b=(0,a.i(170106).default)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);a.s(["Check",()=>b],533441)},992258,a=>{"use strict";let b=(0,a.i(170106).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);a.s(["Mail",()=>b],992258)},603314,a=>{"use strict";let b=(0,a.i(170106).default)("shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);a.s(["Shield",()=>b],603314)},104416,a=>{"use strict";let b=(0,a.i(170106).default)("shield-check",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);a.s(["ShieldCheck",()=>b],104416)},141379,a=>{"use strict";let b=(0,a.i(170106).default)("eye-off",[["path",{d:"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",key:"ct8e1f"}],["path",{d:"M14.084 14.158a3 3 0 0 1-4.242-4.242",key:"151rxh"}],["path",{d:"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",key:"13bj9a"}],["path",{d:"m2 2 20 20",key:"1ooewy"}]]);a.s(["EyeOff",()=>b],141379)},177156,a=>{"use strict";let b=(0,a.i(170106).default)("eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);a.s(["Eye",()=>b],177156)},252181,a=>{"use strict";let b=(0,a.i(170106).default)("panels-top-left",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M9 21V9",key:"1oto5p"}]]);a.s(["Layout",()=>b],252181)},943108,a=>{"use strict";let b=(0,a.i(170106).default)("lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);a.s(["Lock",()=>b],943108)},688424,a=>{"use strict";var b=a.i(187924),c=a.i(572131),d=a.i(346271),e=a.i(262036),f=a.i(533441),g=a.i(633508);let h=[{h:"1. Adhesión y participación",p:"Este documento constituye un contrato de adhesión aplicable a tu participación en torneos y actividades gestionadas por Smart Padel. La aceptación es voluntaria y necesaria para el acceso a funciones del sistema, incluidos ranking y participación."},{h:"2. Condiciones físicas y exoneración",p:"Declara el participante estar en condiciones físicas óptimas para la práctica de alta competencia. El participante libera irrevocablemente a Smart Padel, a sus organizadores y patrocinadores de toda responsabilidad por lesiones, accidentes o percances médicos ocurridos durante la competencia o en las instalaciones."},{h:"3. Protección de datos personales",p:"Al aceptar, autorizas el tratamiento de tus datos personales con la finalidad de gestionar tu participación, comunicarte información de torneos y administrarte dentro de la plataforma. No se venderán tus datos a terceros."},{h:"4. Imagen y material audiovisual",p:"Autorizas el uso de tu nombre e imagen (fotos/videos) con fines promocionales y de transmisión asociada a torneos de Smart Padel, de acuerdo con la Política de Privacidad publicada en la plataforma."},{h:"5. Conducta deportiva",p:"Te comprometes a mantener un espíritu de Fair Play. Conductas antideportivas o incumplimientos pueden implicar la suspensión de acceso a funciones o la expulsión del evento."},{h:"6. Versión y vigencia",p:"La versión vigente de este contrato corresponde a la publicada en Smart Padel. Si existen actualizaciones, te será requerida una nueva aceptación."}];function i({open:a,onClose:i,onAccept:j,loading:k=!1,title:l}){let[m,n]=(0,c.useState)(!1),o=k||m,p=(0,c.useMemo)(()=>l||"Contrato de Adhesión y Exoneración de Responsabilidad",[l]),q=async()=>{if(!o)try{n(!0),await j()}finally{n(!1)}};return(0,b.jsx)(e.AnimatePresence,{children:a&&(0,b.jsxs)("div",{className:"fixed inset-0 z-[260] flex items-center justify-center px-4 py-6",children:[(0,b.jsx)(d.motion.button,{type:"button","aria-label":"Cerrar",className:"absolute inset-0 bg-black/90",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:i}),(0,b.jsxs)(d.motion.div,{initial:{opacity:0,y:16,scale:.98},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:16,scale:.98},transition:{duration:.25,ease:"easeOut"},className:"relative z-[261] w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a] shadow-2xl",children:[(0,b.jsxs)("div",{className:"flex items-start justify-between gap-3 border-b border-white/10 p-5",children:[(0,b.jsxs)("div",{className:"min-w-0",children:[(0,b.jsx)("h3",{className:"text-lg font-black uppercase italic tracking-tight text-white",children:p}),(0,b.jsxs)("p",{className:"mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500",children:["Versión: ","VZLA-2026-V1"]})]}),(0,b.jsx)("button",{type:"button",onClick:i,className:"flex h-10 w-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10",children:(0,b.jsx)(g.X,{className:"h-5 w-5 text-zinc-300"})})]}),(0,b.jsxs)("div",{className:"max-h-[min(70vh,640px)] overflow-y-auto px-5 py-4",children:[(0,b.jsx)("p",{className:"text-sm leading-relaxed text-zinc-400 [text-wrap:pretty]",children:"Al marcar y aceptar este contrato, declaras haber leído y comprendido los términos de Smart Padel, y aceptas participar en los torneos y actividades de la plataforma bajo las condiciones aquí descritas."}),(0,b.jsx)("div",{className:"mt-5 space-y-6",children:h.map((a,c)=>(0,b.jsxs)("section",{children:[(0,b.jsx)("h4",{className:"text-xs font-black uppercase tracking-wider text-[#ccff00]",children:a.h}),(0,b.jsx)("p",{className:"mt-2 text-sm leading-relaxed text-zinc-400 [text-wrap:pretty]",children:a.p})]},c))})]}),(0,b.jsxs)("div",{className:"flex items-center justify-between gap-3 border-t border-white/10 p-5",children:[(0,b.jsxs)("p",{className:"text-[10px] text-zinc-500 leading-relaxed",children:["Al aceptar, se registra tu consentimiento en la tabla ",(0,b.jsx)("span",{className:"text-zinc-300",children:"profiles"}),"."]}),(0,b.jsx)("button",{type:"button",disabled:o,onClick:()=>void q(),className:"inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ccff00] px-5 py-3 text-sm font-black uppercase italic tracking-wide text-black shadow-[0_0_24px_rgba(204,255,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed",children:o?"Guardando…":(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(f.Check,{className:"h-4 w-4"}),"Aceptar"]})})]})]})]})})}a.s(["default",()=>i],688424)},6476,a=>{"use strict";a.s(["isValidEmail",0,a=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.trim()),"isValidPassword",0,a=>"string"==typeof a&&a.length>=6,"validateSignupPassword",0,a=>a.length<8||a.length>16?{valid:!1,error:"Debe tener entre 8 y 16 caracteres"}:/[a-z]/.test(a)?/[A-Z]/.test(a)?/[0-9]/.test(a)?/[^a-zA-Z0-9]/.test(a)?{valid:!0}:{valid:!1,error:"Debe contener al menos un carácter especial (ej. - _ @ # $)"}:{valid:!1,error:"Debe contener al menos un número"}:{valid:!1,error:"Debe contener al menos una letra mayúscula"}:{valid:!1,error:"Debe contener al menos una letra minúscula"}])}];

//# sourceMappingURL=_7292d24e._.js.map