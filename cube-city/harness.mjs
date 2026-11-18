// A stand-in for T3's chat layout, using the selectors the theme targets (copied from T3's own markup on 2026-11-17).
// Query flags toggle states: ?dark&busy&typing&done&failed&fallback&panel. window.set(flag, on) flips one live.
// node harness.mjs [css file] [html file], defaults out/theme.css and out/harness.html.
import fs from 'node:fs'
const [cssFile = new URL('./out/theme.css', import.meta.url), htmlFile = new URL('./out/harness.html', import.meta.url)] = process.argv.slice(2)
const css = fs.readFileSync(cssFile, 'utf8')
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0;height:100%;font:14px/1.5 -apple-system,system-ui,sans-serif}
body{display:flex;background:#f3f2f0;color:#1d1c22}
.dark body{background:#141418;color:#e9e8ee}
[data-slot="sidebar"]{width:260px;background:#ecebe8;border-right:1px solid #0001;padding:16px}
.dark [data-slot="sidebar"]{background:#1b1b20;border-color:#fff1}
[data-sidebar-row]{height:30px;border-radius:8px;margin:6px 0;background:#0000000a;font-size:12px;padding:6px 10px;display:flex;gap:6px;align-items:center}
.dark [data-sidebar-row]{background:#ffffff0d}
[data-sidebar-row][aria-current="page"]{background:#0000001a}
.dot{width:6px;height:6px;border-radius:50%}
[data-workspace-area="conversation"]{flex:1;display:flex;flex-direction:column;background:#fbfaf8;min-width:0}
.dark [data-workspace-area="conversation"]{background:#16161b}
[data-chat-header]{height:44px;border-bottom:1px solid #0001;flex:none}.dark [data-chat-header]{border-color:#fff1}
.messages-timeline-scroll{flex:1;overflow:auto;display:flex}
.col{width:min(760px,100% - 32px);margin:0 auto;padding:24px 0;display:flex;flex-direction:column;gap:14px;justify-content:flex-end}
.u{align-self:flex-end;background:#e9e7f3;border-radius:16px;padding:10px 14px;max-width:70%}.dark .u{background:#26252f}
form{width:min(760px,100% - 32px);margin:0 auto 16px;background:#fff;border:1px solid #0001;border-radius:18px;padding:14px;height:96px;flex:none}
.dark form{background:#1f1f26;border-color:#fff1}
#banner{display:none;font-size:12px;margin-bottom:6px}
[data-thread-details-card]{width:400px;border-left:1px solid #0001;display:none}
</style><style>${css}</style></head><body>
<nav data-slot="sidebar"><div data-sidebar-row aria-current="page" id="me" aria-label="Lets mod t3, Cube moods">Lets mod t3</div>
<div data-sidebar-row id="other" aria-label="Fix the audit page, Cube moods">Fix the audit page<span id="odot"></span></div>
<div data-sidebar-row aria-label="Write the July recap, Cube moods">Write the July recap</div></nav>
<main data-workspace-area="conversation"><header data-chat-header></header><div class="messages-timeline-scroll"><div class="col">
<div class="u" data-timeline-row-kind="message">lets mod t3 with a very tasteful, agnostify style minimalistic background</div>
<p data-timeline-row-kind="message">Building a soft cube city in the corners of the chat, using the approved cube kit. The buildings pop in one by one, then Cubsy, Maya and Nora land on the rooftops.</p>
<p>While a turn runs, the windows light up, a small tower builds itself block by block, and data cubes float off the roofs.</p>
<div id="w"></div></div></div>
<form data-chat-composer-form><div id="banner"><button aria-label="x">x</button> Using a fallback model</div><div class="composer-tiptap" contenteditable><p id="t" class="is-empty"></p></div></form></main>
<aside data-thread-details-card id="panel"></aside>
<script>
const $=id=>document.getElementById(id)
window.set=(f,on)=>{
  if(f==='dark')document.documentElement.classList.toggle('dark',on)
  if(f==='busy')on?$('w').setAttribute('data-timeline-row-kind','working'):$('w').removeAttribute('data-timeline-row-kind')
  if(f==='typing'){$('t').className=on?'':'is-empty';$('t').textContent=on?'1 yes 2 sure 3 go':''}
  if(f==='done')$('other').setAttribute('aria-label','Fix the audit page'+(on?', Completed':'')+', Cube moods')
  if(f==='failed')$('me').setAttribute('aria-label','Lets mod t3'+(on?', Failed':'')+', Cube moods')
  if(f==='fallback'){$('banner').style.display=on?'block':'none';$('banner').firstChild.setAttribute('aria-label',on?'Dismiss fallback model notice':'x')}
  if(f==='panel')$('panel').style.display=on?'block':'none'
}
for(const f of ['dark','busy','typing','done','failed','fallback','panel'])if(new URLSearchParams(location.search).has(f))set(f,true)
</script></body></html>`
fs.writeFileSync(htmlFile, html)
