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
            `}),(0,b.jsxs)("div",{className:`${g}-wrap ${e}`,role:"img","aria-label":"Pelota de pádel",children:[(0,b.jsx)("div",{className:`${g}-ball`}),(0,b.jsx)("div",{className:`${g}-shadow`,style:{marginTop:`${.05*a}px`}})]})]})}a.s(["BouncingBall",()=>c,"default",0,c])},658618,a=>{"use strict";a.s(["DEFAULT_EVENT_SPONSOR_LOGO_URL",0,"https://smartpadel-assets.s3.amazonaws.com/logo-smart-padel-neon.png"])},241449,a=>{"use strict";function b(a){let b=String(a??"").trim(),c=b.match(/^cancha_(.+)$/i);return c?c[1].trim():b}function c(a){let c=b(a);if(/^\d+$/.test(c))return`cancha_${c}`;let d=String(a??"").trim();return/^cancha_/i.test(d)?d:c}function d(a){let b=String(a||"").trim();if(!b)return[];let c=b.match(/^cancha_(\d+)$/i);return c?[b,c[1]]:/^\d+$/.test(b)?[b,`cancha_${b}`]:[b]}async function e(a,b){let c=b.filter(a=>!a.media_content?.url&&a.media_id).map(a=>a.media_id);if(!c.length)return b;let d=Array.from(new Set(c)),{data:e}=await a.from("media_content").select("id, tipo, url, nombre_sponsor, nombre").in("id",d),f=new Map((e||[]).map(a=>[String(a.id),a]));return b.map(a=>{if(a.media_content?.url)return a;let b=f.get(String(a.media_id));return b?{...a,media_content:{id:String(b.id||""),tipo:String(b.tipo||""),url:String(b.url||""),nombre_sponsor:b.nombre_sponsor??null,nombre:b.nombre??null}}:a})}function f(a){if(!a)return null;if(Array.isArray(a)){let b=a[0];return b?{id:String(b.id||""),tipo:String(b.tipo||""),url:String(b.url||""),nombre_sponsor:b.nombre_sponsor??null,nombre:b.nombre??null}:null}return{id:String(a.id||""),tipo:String(a.tipo||""),url:String(a.url||""),nombre_sponsor:a.nombre_sponsor??null,nombre:a.nombre??null}}function g(a){return(a||[]).map(a=>{let b=a||{};return{id:String(b.id||""),cancha_id:String(b.cancha_id||""),venue_name:b.venue_name?String(b.venue_name):void 0,media_id:String(b.media_id||""),orden:Number(b.orden||0),duracion_segundos:Number(b.duracion_segundos||0),playlist_slot:b.playlist_slot??void 0,posicion_pantalla:b.posicion_pantalla?String(b.posicion_pantalla):null,media_content:f(b.media_content??b.publicidad)}})}function h(a,b){if(!b)return a;let c=b.trim().toLowerCase();return a.filter(a=>String(a.venue_name??"").trim().toLowerCase()===c)}async function i(a,b,c){let f=d(b),i=a=>a.some(a=>!!a.media_content?.url),j=c?.trim()||null,k=a.from("cancha_publicidad").select("id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, media_content(*)").in("cancha_id",f).order("orden",{ascending:!0});j&&(k=k.ilike("venue_name",j));let l=await k;if(!l.error&&(l.data||[]).length>0){let b=await e(a,g(l.data||[]));if(i(b)||b.length>0)return{...l,data:b}}let m=a.from("cancha_publicidad").select("id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, publicidad(*)").in("cancha_id",f).order("orden",{ascending:!0});j&&(m=m.ilike("venue_name",j));let n=await m;if(!n.error&&(n.data||[]).length>0){let b=await e(a,g(n.data||[]));if(i(b)||b.length>0)return{...n,data:b}}let o=a.from("cancha_publicidad").select("id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, media_content(*)").in("cancha_id",f).order("orden",{ascending:!0}),p=await o;if(!p.error){let b=await e(a,g(p.data||[]));if(i(b=h(b,j))||b.length>0)return{...p,data:b}}let q=a.from("cancha_publicidad").select("id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla, publicidad(*)").in("cancha_id",f).order("orden",{ascending:!0}),r=await q;if(!r.error){let b=await e(a,g(r.data||[]));if((b=h(b,j)).length>0||!j)return{...r,data:b}}let s=a.from("cancha_publicidad").select("id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla").in("cancha_id",f).order("orden",{ascending:!0});j&&(s=s.ilike("venue_name",j));let t=await s;if(!t.error){let b=await e(a,g(t.data||[]));if(i(b=h(b,j))||b.length>0)return{...t,data:b}}let u=await a.from("cancha_publicidad").select("id, cancha_id, venue_name, media_id, orden, duracion_segundos, playlist_slot, posicion_pantalla").in("cancha_id",f).order("orden",{ascending:!0});if(!u.error){let b=await e(a,g(u.data||[]));return b=h(b,j),{...u,data:b}}return r}async function j(a,b,c){if(!c.trim())return null;let e=d(b),f=c.trim(),{data:g,error:h}=await a.from("cancha_playlist_config").select("*").in("cancha_id",e).ilike("venue_name",f).limit(1);if(!h&&g?.[0])return g[0];let{data:i,error:j}=await a.from("cancha_playlist_config").select("*").in("cancha_id",e).eq("venue_name",f).maybeSingle();if(!j&&i)return i;let{data:k,error:l}=await a.from("cancha_playlist_config").select("*").in("cancha_id",e).limit(1).maybeSingle();return l||!k?null:k}async function k(a,b,c){let e=d(b),f=c?.trim();if(f){let{data:b,error:c}=await a.from("cancha_tira").select("tira_informativa_id, orden").in("cancha_id",e).ilike("venue_name",f).order("orden",{ascending:!0});if(!c&&b?.length){let c=b.map(a=>a.tira_informativa_id),{data:d,error:e}=await a.from("tira_informativa").select("id, mensaje, activo").in("id",c).eq("activo",!0);if(e||!d?.length)return[];let f=new Map(c.map((a,b)=>[a,b]));return d.filter(a=>f.has(a.id)).sort((a,b)=>(f.get(a.id)??0)-(f.get(b.id)??0))}let{data:d,error:g}=await a.from("cancha_tira").select("tira_informativa_id, orden, venue_name").in("cancha_id",e).order("orden",{ascending:!0});if(!g&&d?.length){let b=f.toLowerCase(),c=d.filter(a=>String(a.venue_name??"").trim().toLowerCase()===b);if(c.length>0){let b=c.map(a=>a.tira_informativa_id),{data:d,error:e}=await a.from("tira_informativa").select("id, mensaje, activo").in("id",b).eq("activo",!0);if(!e&&d?.length){let a=new Map(b.map((a,b)=>[a,b]));return d.filter(b=>a.has(b.id)).sort((b,c)=>(a.get(b.id)??0)-(a.get(c.id)??0))}}}}let{data:g,error:h}=await a.from("tira_informativa").select("id, mensaje").eq("activo",!0).order("orden",{ascending:!0});return h||!g?[]:g}function l(a){let b=[],c=[];for(let d of a){let a=f(d.media_content),e={...d,media_content:a},g=String(e.media_content?.tipo||""),h="imagen"===g,i=(g.includes("video"),e.playlist_slot||"legacy");if("legacy"===i){h?c.push(e):b.push(e);continue}"imagen"===i?c.push(e):b.push(e)}return b.sort((a,b)=>(a.orden??0)-(b.orden??0)),c.sort((a,b)=>(a.orden??0)-(b.orden??0)),{video:b,imagen:c}}a.s(["canchaIdCandidates",()=>d,"canchaIdStoredForPublicidadTables",()=>c,"fetchCanchaPlaylistConfig",()=>j,"fetchCanchaPlaylistRows",()=>i,"fetchCanchaTiraMessages",()=>k,"normalizeCanchaIdKey",()=>b,"normalizeCourtPlaylistRows",()=>g,"partitionPlaylistRows",()=>l])},662248,a=>{"use strict";var b=a.i(187924),c=a.i(572131);function d({url:a,videoKey:d,className:e="w-full h-full object-cover",loop:f,onEnded:g,onNativeVideoError:h,title:i="Publicidad vídeo"}){let j,[k,l]=(0,c.useState)(!1);return(0,c.useEffect)(()=>{l(!1)},[a]),(j=(a||"").trim().toLowerCase())&&(j.includes("youtube.com")||j.includes("youtu.be")||j.includes("vimeo.com")||j.includes("twitch.tv")||j.includes("dailymotion.com")||j.includes("/embed/"))||k?(0,b.jsx)("iframe",{src:function(a){let b=a.trim(),c=b.toLowerCase();if(c.includes("youtube.com/watch?v=")){let a=b.split("v=")[1]?.split("&")[0];if(a)return`https://www.youtube.com/embed/${a}?autoplay=1&mute=1&loop=1&playlist=${a}&playsinline=1`}if(c.includes("youtu.be/")){let a=b.split("youtu.be/")[1]?.split("?")[0];if(a)return`https://www.youtube.com/embed/${a}?autoplay=1&mute=1&loop=1&playlist=${a}&playsinline=1`}return c.includes("youtube.com/embed/")?b.includes("?")?b:`${b}?autoplay=1&mute=1&playsinline=1`:b}(a),className:`border-0 ${e}`,allow:"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",allowFullScreen:!0,title:i},d):(0,b.jsx)("video",{src:a,className:e,autoPlay:!0,muted:!0,playsInline:!0,loop:f,onEnded:g,onError:()=>{l(!0),h?.()}},d)}a.s(["CourtAdVideoOrIframe",()=>d],662248)},106309,a=>{"use strict";let b=/^(pareja\s*\d*|jugador\s*\d*|player\s*\d*|equipo\s*\d*|placeholder|tbd|\?|j\d+|p\d+)$/i;function c(a){if(!a)return!1;let c=a.trim();return!!c&&"?"!==c&&"-"!==c&&!b.test(c)}function d(a,b,d,e,f){if(a){if(a.isTBD)return(a.teamLabel||"TBD").trim()||"TBD";let b="string"==typeof a.full?a.full.trim():"";if(c(b)){let a=b.split(/\s*\/\s*/).map(a=>a.trim()).filter(Boolean);if(a.length>=2)return b;if(1===a.length&&c(a[0]))return a[0]}let d="string"==typeof a.name?a.name.trim():"";if(c(d)){let a=d.split(/\s*\/\s*/).map(a=>a.trim()).filter(Boolean);if(a.length>=2)return d;if(1===a.length&&c(a[0]))return a[0]}let e=(a.p1?.name||a.p1Name||"").trim(),f=(a.p2?.name||a.p2Name||"").trim();if(c(e)||c(f))return[c(e)?e:"?",c(f)?f:""].filter(Boolean).join(" / ")}if(d&&c(d)){let a=d.split("/").map(a=>a.trim()).filter(c);if(a.length>=2)return d.trim();if(1===a.length)return a[0]}let g=e?f.find(a=>a.id===e||a.teamId===e):null,h=b>0?f[b-1]:f[b]??null,i=g||h||null;if(i){let a=(i.full||i.teamName||i.name||"").toString().trim();if(c(a)){let b=a.split(/\s*\/\s*/).map(a=>a.trim()).filter(Boolean);if(b.length>=2)return a;if(1===b.length&&c(b[0]))return b[0]}let b=(i.p1?.name||i.p1Name||"").trim(),d=(i.p2?.name||i.p2Name||"").trim();if(c(b)||c(d))return[b,d].filter(c).join(" / ")}return(d||"").trim()||""}function e(a,b){let c=b?.teams||[];return{team1:d(a?.team1,a?.team1Index??0,a?.team1Name,a?.team1Id||a?.team1?.id,c)||"Equipo 1",team2:d(a?.team2,a?.team2Index??0,a?.team2Name,a?.team2Id||a?.team2?.id,c)||"Equipo 2"}}function f(a,b){let c=(a||"").trim();return!!(!c||c===b||/^(equipo|jugador|pareja|player|tbd)\s*\d*$/i.test(c))||"?"===c||"-"===c}a.s(["isGenericEquipoNombre",()=>f,"resolveMatchTeamLines",()=>e])},549708,a=>{"use strict";let b={PRIMERA:"1ª",SEGUNDA:"2ª",TERCERA:"3ª",CUARTA:"4ª",QUINTA:"5ª",SEXTA:"6ª",SEPTIMA:"7ª",MAS_40:"+40",FEM_40:"+40",MIX_40:"+40",MAS_45:"+45",MAS_50:"+50",SUMA_7:"Suma 7",SUMA_8:"Suma 8",SUMA_9:"Suma 9",SUMA_10:"Suma 10",SUMA_11:"Suma 11"};function c(a){if(!a)return"";let b=String(a).trim();if(!b)return"";let c=b.toUpperCase(),d=b.toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return"MALE"===c||"M"===c||"masculine"===d||"masculino"===d||"male"===d||"hombre"===d||"masc"===d?"Masculino":"FEMALE"===c||"F"===c||"feminine"===d||"femenino"===d||"female"===d||"mujer"===d||"fem"===d?"Femenino":"MIXED"===c||"mixed"===d||"mixto"===d||"mix"===d||"mixta"===d?"Mixto":"MASCULINO"===c?"Masculino":"FEMENINO"===c?"Femenino":"MIXTO"===c||"MIXTA"===c?"Mixto":b}function d(a){return a?b[String(a).toUpperCase()]??String(a).replace(/_/g," "):""}function e(a){if(!a)return{levelLine:"",genderLine:""};let b=a.category?String(a.category).toUpperCase():"",e=["MALE","FEMALE","MIXED"].includes(b),f=c(a.gender)||(e?c(a.category):"");return{levelLine:b&&!e?d(a.category):"",genderLine:f}}function f(a,b){let c=(a||"").trim();return c?`${c} \xb7 Pista ${b}`:`Pista ${b}`}a.s(["buildCourtHeadline",()=>f,"formatPizarraCategoryLevel",()=>d,"formatPizarraGender",()=>c,"splitPizarraCategoryMeta",()=>e])}];

//# sourceMappingURL=src_8c25e423._.js.map