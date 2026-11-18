// Cube kit: the approved 2D cube characters (round four, "Both cube teams in Alec's style", signed off 2026-10-16)
// as SVG strings. The drawing code is the mockup's, unchanged; only the wrapper is new.
//
// Load it as a classic script (<script src="cube-kit.js">) or import it for its side effect; either way it sets
// globalThis.CubeKit. No dependencies, no DOM needed to build the SVG strings (team(), swatches() and injectStyles()
// need one).
//
//   CubeKit.cube(member, { boss, delay })   one cube as an <svg> string, viewBox 0 0 200 222
//   CubeKit.card(member, { boss, delay })   the cube plus its name, job and vibe
//   CubeKit.team(el, team)                  a boss on top, the crew below, joined by lines (el: element or id)
//   CubeKit.swatches(el, cast)              the colour row under the teams
//   CubeKit.injectStyles(doc, { layout })   adds the idle motion CSS (and the team layout CSS unless layout is false)
//   CubeKit.addAccessory(name, draw, how)   a draft accessory from a cast file (how: 'held', 'worn' or 'tucked')
//
// A member: { n, c, job, vibe, acc, idle, tilt, look, eyeAnim, eyes }. See SKILL.md for every field.
(function (root) {
  const shade=(hex,amt)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(amt>0?v+(255-v)*amt:v*(1+amt))));return '#'+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,'0')).join('')};
  const INK='#0b0b12', uid=()=>'u'+Math.random().toString(36).slice(2,8);
  const EL=73,ER=127,EY=122;

  // one eye: a tall squared-off black pill (no glint), cut by a lid line that the brow angle tilts; or a happy arc
  function eye(x,side,p,mag=1){
    const w=17*(p.size||1)*mag,h=40*(p.size||1)*mag,cx=x,cy=EY,id=uid();
    if(p.happy) return `<path d="M${cx-w*.85} ${cy+5} Q${cx} ${cy-18*mag} ${cx+w*.85} ${cy+5}" stroke="${INK}" stroke-width="${7*mag}" fill="none" stroke-linecap="round"/>`;
    const lidY=cy-h/2+h*(p.lid||0)*.9, s=Math.tan((p.brow||0)*Math.PI/180)*(side<0?-1:1);
    const yAt=xr=>lidY+s*xr;
    const clip=`<clipPath id="${id}"><polygon points="${cx-w} ${yAt(-w)} ${cx+w} ${yAt(w)} ${cx+w} ${cy+h} ${cx-w} ${cy+h}"/></clipPath>`;
    const lash=p.lash?(side<0?`<path d="M${cx-w*.45} ${yAt(-w*.45)+1}l-8-7M${cx+w*.05} ${yAt(0)}l-4-9M${cx+w*.5} ${yAt(w*.5)}l0-9" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`:`<path d="M${cx+w*.45} ${yAt(w*.45)+1}l8-7M${cx-w*.05} ${yAt(0)}l4-9M${cx-w*.5} ${yAt(-w*.5)}l0-9" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`):'';
    return `<defs>${clip}</defs><g clip-path="url(#${id})"><rect x="${cx-w/2}" y="${cy-h/2}" width="${w}" height="${h}" rx="${5*mag}" fill="${INK}"/><rect x="${cx-w/2+2}" y="${cy-h/2+2}" width="${w*.35}" height="${h*.5}" rx="3" fill="#fff" opacity=".12"/></g>${lash}`;
  }

  // a floating mitten in a lighter tint of the cube's own colour; tools are held in these, never left floating
  const mitten=(x,y,r,c)=>{const m=shade(c,.55);return `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse cx="0" cy="2" rx="12" ry="13" fill="#000" opacity=".2"/><ellipse rx="12" ry="13" fill="${m}"/><ellipse cx="-11" cy="-1" rx="5" ry="7.5" transform="rotate(-28 -11 -1)" fill="${m}"/><ellipse cx="-3" cy="-5" rx="4" ry="2.5" fill="#fff" opacity=".6"/></g>`};

  // accessories: each returns layers drawn behind the cube (back), over the body under the eyes (under), or on top (over)
  const ACC={
    headset:c=>({over:`<path d="M21 110 Q16 10 100 8 Q184 10 179 110" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="9" y="96" width="19" height="32" rx="8" fill="#1d1d27"/><rect x="172" y="96" width="19" height="32" rx="8" fill="#1d1d27"/><path d="M20 126 Q26 166 80 162" stroke="#1d1d27" stroke-width="4.5" fill="none" stroke-linecap="round"/><rect x="78" y="156" width="12" height="11" rx="5" fill="#2c2c38"/>`}),
    lens:c=>({over:`<path d="M146 144 L164 170" stroke="#7a5c45" stroke-width="9" stroke-linecap="round"/>${mitten(167,176,-20,c)}<circle cx="127" cy="122" r="29" fill="${shade(c,.1)}"/>${eye(127,1,{size:1},1.5)}<circle cx="127" cy="122" r="29" fill="#dff3ff" fill-opacity=".18" stroke="#e3e5ec" stroke-width="6"/><path d="M110 108a20 20 0 0 1 14-9" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".85"/>`}),
    sticky:c=>({over:`<g transform="translate(30 60) rotate(-10)"><rect width="36" height="34" rx="3" fill="#fff0a0"/><path d="M0 0h36v8H0z" fill="#f6dc6a"/><path d="M7 16h20M7 23h13" stroke="#b9962a" stroke-width="2.5" stroke-linecap="round"/><path d="M36 26 l-10 8 h10z" fill="#e8cf6a"/></g>`}),
    sweatband:c=>({back:`<path d="M176 78q22-8 26 6q-14-3-24 6z" fill="#f2f2f6"/><path d="M176 84q18 4 18 20q-8-10-20-12z" fill="#d9d9e2"/>`,under:`<rect x="20" y="74" width="160" height="15" fill="#f2f2f6"/><rect x="20" y="79.5" width="160" height="4" fill="#ef6f73"/>`,over:`<path d="M38 96q-6 10 0 14q6-4 0-14z" fill="#bfe6ff"/>`}),
    checkbook:c=>({over:`<g transform="translate(166 168) rotate(14)"><rect x="-27" y="-18" width="54" height="34" rx="5" fill="#f4faf1" stroke="#7fa97a" stroke-width="2.5"/><path d="M-19 -7h22M-19 1h30M-19 9h14" stroke="#7fa97a" stroke-width="2.5" stroke-linecap="round"/><text x="13" y="-2" font-size="12" font-weight="800" fill="#4f8a4a" font-family="system-ui">$</text></g>${mitten(186,178,-30,c)}`}),
    glasses:c=>({over:`<g fill="none" stroke="#1d1d27" stroke-width="5"><rect x="50" y="97" width="46" height="50" rx="15"/><rect x="104" y="97" width="46" height="50" rx="15"/><path d="M96 114q4-5 8 0"/><path d="M50 110l-29-5M150 110l29-5"/></g><rect x="50" y="97" width="46" height="50" rx="15" fill="#fff" opacity=".1"/><rect x="104" y="97" width="46" height="50" rx="15" fill="#fff" opacity=".1"/>`}),
    phone:c=>({over:`<g transform="translate(176 136) rotate(-14)"><rect x="-18" y="-32" width="36" height="64" rx="8" fill="#1d1d27"/><rect x="-15" y="-28" width="30" height="56" rx="5" fill="#a9c1ff"/><rect x="-11" y="-22" width="22" height="20" rx="3" fill="#ffc9dc"/><path d="M-6 -12a3 3 0 0 1 6 0a3 3 0 0 1 6 0q0 4-6 8q-6-4-6-8z" fill="#ff5d7a"/><path d="M-11 5h22M-11 12h14" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></g>${mitten(184,168,-24,c)}`}),
    binoculars:c=>({over:`<g transform="translate(100 168)"><rect x="-36" y="-16" width="30" height="34" rx="11" fill="#1d1d27"/><rect x="6" y="-16" width="30" height="34" rx="11" fill="#1d1d27"/><rect x="-8" y="-8" width="16" height="12" rx="4" fill="#3a3a48"/><ellipse cx="-21" cy="-14" rx="11" ry="4" fill="#a9d4ff"/><ellipse cx="21" cy="-14" rx="11" ry="4" fill="#a9d4ff"/></g>${mitten(56,178,-30,c)}${mitten(144,178,30,c).replace('rotate(30)','rotate(30) scale(-1 1)')}`}),
    clapper:c=>({over:`<g transform="translate(100 186)"><rect x="-30" y="-12" width="60" height="30" rx="4" fill="#1d1d27"/><path d="M-22 0h26M-22 8h18" stroke="#9a9ab0" stroke-width="2.5" stroke-linecap="round"/><g class="clap" style="transform-origin:-30px -12px"><g transform="rotate(-22 -30 -12)"><rect x="-30" y="-23" width="60" height="11" rx="3" fill="#f4f4f8"/><path d="M-20 -23l-7 11M-6 -23l-7 11M8 -23l-7 11M22 -23l-7 11" stroke="#1d1d27" stroke-width="4.5"/></g></g></g>${mitten(62,194,-20,c)}${mitten(138,194,20,c).replace('rotate(20)','rotate(20) scale(-1 1)')}`}),
    pencil:c=>({back:`<g transform="translate(166 46) rotate(-38)"><rect x="-6" y="-38" width="12" height="62" rx="2" fill="#ffd76a"/><rect x="-6" y="-38" width="4" height="62" fill="#f2c24f"/><rect x="-6" y="-46" width="12" height="9" rx="3" fill="#f49ab0"/><rect x="-6" y="-38" width="12" height="4" fill="#c9c9d4"/></g>`}),
    tablet:c=>({over:`<g transform="translate(100 182) rotate(-4)"><rect x="-34" y="-20" width="68" height="40" rx="6" fill="#1d1d27"/><rect x="-30" y="-16" width="60" height="32" rx="3" fill="#f6f4ee"/><rect x="-24" y="2" width="9" height="10" rx="2" fill="#9cc7ff"/><rect x="-11" y="-3" width="9" height="15" rx="2" fill="#9cc7ff"/><rect x="2" y="-7" width="9" height="19" rx="2" fill="#9cc7ff"/><rect x="15" y="-12" width="9" height="24" rx="2" fill="#57d38c"/></g>${mitten(62,190,-24,c)}${mitten(138,190,24,c).replace('rotate(24)','rotate(24) scale(-1 1)')}`})
  };

  // the cube: drop shadow, 3-tier stepped crown, lacquer body with its side face and gloss strokes, printed blush, eyes
  function cube(m,{delay=0,boss=false}={}){
    if(!ACC[m.acc])throw new Error(`cube ${m.n}: no accessory "${m.acc}" in CubeKit.ACC (run check-cast.mjs)`);
    const c=m.c,id=uid(),hi=shade(c,.5),lo=shade(c,-.22),side=shade(c,-.32),a=ACC[m.acc](c),e=m.eyes||{};
    const L={...e,...(e.L||{})},R={...e,...(e.R||{})},look=m.look||[0,0];
    const tier=(x,y,w,h,r)=>`<rect x="${x+6}" y="${y-3}" width="${w}" height="${h}" rx="${r}" fill="${side}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${id})"/><rect x="${x+4}" y="${y+2}" width="${w-8}" height="3" rx="1.5" fill="#fff" opacity=".55"/>`;
    return `<svg viewBox="0 0 200 222"><defs>
    <linearGradient id="${id}" x1="0" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".42" stop-color="${c}"/><stop offset="1" stop-color="${lo}"/></linearGradient>
    <radialGradient id="${id}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}b" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff7d94" stop-opacity=".85"/><stop offset="1" stop-color="#ff7d94" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="104" cy="214" rx="68" ry="7" fill="url(#${id}s)"/>
    <g transform="rotate(${m.tilt||0} 100 205)"><g class="idle ${boss?'bosshop':m.idle||'bob'}" style="animation-delay:${-delay}s">
      ${a.back||''}
      ${tier(84,24,32,12,5)}${tier(70,33,60,13,6)}${tier(54,42,92,14,7)}
      <rect x="31" y="45" width="160" height="150" rx="40" fill="${side}"/>
      <rect x="20" y="52" width="160" height="150" rx="40" fill="url(#${id})"/>
      <path d="M40 74q4-18 40-20" stroke="#fff" stroke-opacity=".7" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M168 120v40" stroke="#fff" stroke-opacity=".18" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="46" cy="146" rx="16" ry="9" fill="url(#${id}b)"/><ellipse cx="154" cy="146" rx="16" ry="9" fill="url(#${id}b)"/>
      ${a.under||''}
      <g transform="translate(${look[0]} ${look[1]})"><g class="eyes ${m.eyeAnim||''}"><g class="blink" style="animation-delay:${-delay*1.3}s">${eye(EL,-1,L)}${eye(ER,1,R)}</g></g></g>
      ${a.over||''}
    </g></g></svg>`;
  }

  const card=(m,o)=>`<div class="member">${cube(m,o)}<div class="name">${m.n}</div><div class="job" style="color:${shade(m.c,.3)}">${m.job}</div><div class="vibe">${m.vibe}</div></div>`;
  const lines=n=>{const xs=Array.from({length:n},(_,i)=>Math.round(560*(i+.5)/n));return `<svg class="lines" viewBox="0 0 560 20" preserveAspectRatio="none"><path d="M280 0V7M${xs[0]} 7H${xs[n-1]}${xs.map(x=>`M${x} 7V20`).join('')}" stroke="#2c2a3a" stroke-width="1.5" fill="none"/></svg>`};
  const $=(el)=>typeof el==='string'?document.getElementById(el):el;
  const teamHTML=({eyebrow,title,boss,members})=>`<div class="eyebrow">${eyebrow}</div><h2>${title}</h2><div class="boss member">${card(boss,{boss:true})}</div>${lines(members.length)}<div class="crew" style="grid-template-columns:repeat(${members.length},1fr)">${members.map((m,i)=>card(m,{delay:i*.55})).join('')}</div>`;
  const team=(el,t)=>{$(el).innerHTML=teamHTML(t)};
  // Cubsy and Alec's two colours first, marked as his; then each team's boss (unless it is one of his) and members
  const swatchList=cast=>{const own=new Set(cast.originals.map(m=>m.n));return [...cast.originals.map(m=>({...m,alec:1})),...cast.teams.flatMap(t=>[...(own.has(t.boss.n)?[]:[t.boss]),...t.members])]};
  const swatches=(el,cast)=>{$(el).innerHTML=swatchList(cast).map(m=>`<span class="sw${m.alec?' alec':''}"><i style="background:${m.c}"></i>${m.n}${m.alec?' (Alec’s)':''}</span>`).join('')};

  // the idle motions. Every animated class stops under prefers-reduced-motion and the cube rests in its pose.
  const CSS=`
  g.idle,g.eyes{transform-box:fill-box}
  .bob{animation:bob 2.8s ease-in-out infinite alternate;transform-origin:50% 100%}
  .bounce{animation:bounce .9s cubic-bezier(.3,0,.4,1) infinite;transform-origin:50% 100%}
  .breathe{animation:breathe 3.8s ease-in-out infinite;transform-origin:50% 100%}
  .sway{animation:sway 3.2s ease-in-out infinite;transform-origin:50% 100%}
  .lean{animation:lean 2.6s ease-in-out infinite;transform-origin:50% 100%}
  .bosshop{animation:hop 6s infinite;transform-origin:50% 100%}
  .scan{animation:scan 2.4s ease-in-out infinite}
  .peek{animation:peek 1.8s ease-in-out infinite}
  .blink{animation:blink 4.6s infinite;transform-origin:50% 50%;transform-box:fill-box}
  .clap{animation:clap 1.6s infinite;transform-box:view-box}
  @keyframes bob{from{transform:translateY(0)}to{transform:translateY(-5px)}}
  @keyframes bounce{0%,100%{transform:translateY(0) scale(1.05,.95)}40%{transform:translateY(-10px) scale(.97,1.04)}70%{transform:translateY(0) scale(1.02,.98)}}
  @keyframes breathe{0%,100%{transform:scale(1,1)}50%{transform:scale(1.025,1.035)}}
  @keyframes sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
  @keyframes lean{0%,100%{transform:rotate(0)}50%{transform:rotate(6deg) translateX(3px)}}
  @keyframes hop{0%,38%,62%,100%{transform:translateY(0) scale(1,1)}41%{transform:translateY(0) scale(1.08,.9)}47%{transform:translateY(-16px) scale(.95,1.06)}53%{transform:translateY(0) scale(1.07,.92)}57%{transform:translateY(0) scale(1,1)}}
  @keyframes scan{0%,100%{transform:translateX(-5px)}45%,55%{transform:translateX(5px)}}
  @keyframes peek{0%,100%{transform:translate(4px,-4px)}30%{transform:translate(-4px,-4px)}60%{transform:translate(5px,-2px)}}
  @keyframes blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}
  @keyframes clap{0%,60%,100%{transform:rotate(0)}70%{transform:rotate(16deg)}}
  @media (prefers-reduced-motion:reduce){.bob,.bounce,.breathe,.sway,.lean,.bosshop,.scan,.peek,.blink,.clap{animation:none}}
`;
  // the team sheet's layout, as the mockup had it (the var() fallbacks stand in for the mockup host's tokens)
  const LAYOUT_CSS=`
  .stage{background:#0b0c11;border-radius:var(--radius,16px);padding:26px 20px 22px;color:#ece9f5;font-family:var(--font-sans,system-ui,-apple-system,"Segoe UI",sans-serif)}
  .team+.team{margin-top:26px;padding-top:24px;border-top:1px solid #23222e}
  .eyebrow{font:600 11px/1 var(--font-mono,ui-monospace,"SF Mono",Menlo,monospace);letter-spacing:.14em;color:#8f8aa8;text-transform:uppercase;text-align:center}
  .stage h2{margin:8px 0 14px;text-align:center;font-weight:650;font-size:21px;letter-spacing:-.01em}
  .boss{display:flex;flex-direction:column;align-items:center}
  .crew{display:grid;gap:8px}
  .member{text-align:center}
  .member svg{display:block;margin:0 auto;overflow:visible}
  .boss svg{width:136px}
  .crew svg{width:100%;max-width:112px}
  .name{font-weight:650;font-size:15px;margin-top:2px}
  .job{font:600 10.5px/1.3 var(--font-mono,ui-monospace,"SF Mono",Menlo,monospace);letter-spacing:.06em;text-transform:uppercase;margin-top:3px}
  .vibe{color:#a6a2bb;font-size:12px;line-height:1.4;margin-top:5px}
  .lines{display:block;width:100%;height:20px;margin:0 auto 2px;max-width:560px}
  .swatches{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 14px;margin-top:24px;padding-top:18px;border-top:1px solid #23222e}
  .sw{display:flex;align-items:center;gap:6px;font-size:11.5px;color:#a6a2bb}
  .sw i{width:14px;height:14px;border-radius:5px;display:block}
  .sw.alec{color:#ece9f5}
  @media (max-width:600px){.crew{grid-template-columns:repeat(3,1fr)!important;row-gap:18px}.lines{display:none}}
`;
  function injectStyles(doc=document,{layout=true}={}){const s=doc.createElement('style');s.textContent=CSS+(layout?LAYOUT_CSS:'');doc.head.appendChild(s);return s}

  // what the cast checker validates against
  const IDLES=['bob','bounce','breathe','sway','lean'], EYE_ANIMS=['scan','peek'];
  const EYE_KEYS=['size','lid','brow','happy','lash','L','R'];
  // which accessories put a mitten on the cube, and how the job is carried (held, worn or tucked)
  const ACC_INFO={headset:'worn',lens:'held',sticky:'worn',sweatband:'worn',checkbook:'held',glasses:'worn',phone:'held',binoculars:'held',clapper:'held',pencil:'tucked',tablet:'held'};

  // a draft accessory from a cast file, so a project can preview one without editing this kit. carried is 'held'
  // (in mittens), 'worn' or 'tucked'. Once Sully approves it, move it into ACC and ACC_INFO above.
  function addAccessory(name,draw,carried){ACC[name]=draw;ACC_INFO[name]=carried}

  root.CubeKit={cube,card,eye,mitten,shade,ACC,ACC_INFO,IDLES,EYE_ANIMS,EYE_KEYS,addAccessory,team,teamHTML,swatches,injectStyles,CSS,LAYOUT_CSS,INK};
})(typeof globalThis!=='undefined'?globalThis:window);
