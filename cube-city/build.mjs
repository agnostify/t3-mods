// Builds the Agnostify cube-city backdrop for T3 Code as one theme CSS file.
// Run: CUBE_KIT=<kit folder> node build.mjs  ->  out/cube-city.json and out/cube-city-calm.json (T3 theme files),
//      out/theme.css and out/theme-calm.css (the same CSS alone), out/*.svg (to eyeball)
// Look: node harness.mjs, then open out/harness.html (?dark&busy&typing&done&failed&panel) in Chrome.
// Publish: t3 theme set out/cube-city.json (or sh power/install.sh for the battery switch). Undo: t3 theme set t3-chat.
//
// How the moods work. T3 themes are CSS only, and an SVG background restarts its own animations whenever it is
// swapped, so each cube is three layers that never get swapped: its body (static), its everyday eyes and a pair of
// happy eyes (each only blinks). Everything that moves a cube (landing, idle bob or hop, cheering, slumping,
// glancing, jumping when clicked) is driven from the page by animating a few registered custom properties that
// the layers' size and position are computed from. That keeps body and eyes on one clock.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const HERE = path.dirname(new URL(import.meta.url).pathname)
// The cube drawing kit (cube-kit.js and cast.js) is Agnostify's and is not in this repo; point CUBE_KIT at a folder
// that has it. The built themes in out/ work without it.
const KIT = process.env.CUBE_KIT
if (!KIT || !fs.existsSync(`${KIT}/cube-kit.js`)) throw new Error('Set CUBE_KIT to the folder with cube-kit.js and cast.js. Prebuilt themes are in out/.')
vm.runInThisContext(fs.readFileSync(`${KIT}/cube-kit.js`, 'utf8'))
vm.runInThisContext(fs.readFileSync(`${KIT}/cast.js`, 'utf8'))
const { CubeKit, CUBE_CAST } = globalThis
const shade = CubeKit.shade
const r1 = n => Math.round(n * 10) / 10
const r3 = n => Math.round(n * 1000) / 1000

// ---------- the approved cubes, split into body and eyes ----------
const crew = CUBE_CAST.teams.find(t => t.id === 'crew')
const content = CUBE_CAST.teams.find(t => t.id === 'content')
const NS = 'xmlns="http://www.w3.org/2000/svg"'
// cut the eye group (the <g transform="translate(look)"> that wraps .eyes) out of a kit cube, by counting <g> depth
function withoutEyes(svg) {
  const start = svg.search(/<g transform="translate\([^)]*\)"><g class="eyes/)
  if (start < 0) throw new Error('kit changed: eye group not found')
  const re = /<g[\s>]|<\/g>/g
  re.lastIndex = start
  let depth = 0, m
  while ((m = re.exec(svg))) {
    depth += m[0] === '</g>' ? -1 : 1
    if (depth === 0) break
  }
  const cut = svg.slice(start, re.lastIndex)
  if (!cut.includes('class="eyes')) throw new Error('kit changed: eye group not found where expected')
  return svg.slice(0, start) + svg.slice(re.lastIndex)
}
// a static body: the kit drawing minus its eyes, stretched to whatever size the page gives it (that is how it squashes)
const body = (member, opts) => withoutEyes(CubeKit.cube(member, opts))
  .replace('<svg viewBox="0 0 200 222">', `<svg ${NS} viewBox="0 0 200 222" preserveAspectRatio="none">`)
// Cubsy is drawn the way worlds.js draws townsfolk: the kit cube with its tucked pencil removed
const cubsyBody = body({ n: 'Cubsy', c: '#5b95f2', acc: 'pencil', eyes: {} }).replace(/<g transform="translate\(166 46\)[\s\S]*?<\/g>/, '')
const mayaBody = body(crew.boss, { boss: true })
const noraBody = body(content.boss, { boss: true })

// eyes only, in the same 200 x 222 box as the body, blinking (blink is self-contained, so a restart is harmless)
const BLINK = '.k{animation:k 4.6s infinite;transform-origin:50% 50%;transform-box:fill-box}@keyframes k{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}@media (prefers-reduced-motion:reduce){.k{animation:none}}'
const eyes = (p, delay) => `<svg ${NS} viewBox="0 0 200 222" preserveAspectRatio="none"><style>${BLINK}</style><g class="k" style="animation-delay:-${delay}s">${CubeKit.eye(73, -1, p)}${CubeKit.eye(127, 1, p)}</g></svg>`
const EYES = {
  plain: eyes({}, 0),                     // Cubsy, everyday
  kind: eyes(crew.boss.eyes, 1.6),        // Maya, everyday (brow 5, lid .1)
  happy: eyes({ happy: true }, 3.1),      // Nora everyday; everyone when cheering
  sad: eyes({ brow: 13, lid: 0.3 }, 0.8), // everyone when the thread fails: outer corners droop, lids down
}

// ---------- isometric boxes ----------
const NEUTRAL = { top: '#f6f4fa', left: '#e4e0ee', right: '#d0cbde', win: '#bdb7d0' }
const tint = c => ({ top: shade(c, 0.5), left: shade(c, 0.22), right: shade(c, -0.06), win: shade(c, -0.25) })

function iso(ox, oy, A) {
  const h2 = n => Math.round(n * 2) / 2
  const Pn = (x, y, z) => [h2(ox + (x - y) * A), h2(oy + (x + y) * A / 2 - z * A)]
  const P = (x, y, z) => Pn(x, y, z).join(' ')
  const poly = (pts, fill, extra = '') => `<path d="M${pts.join('L')}Z" fill="${fill}"${extra}/>`
  // one building: three faces, a soft highlight on the top's front edges
  function box(b) {
    const { x, y, w = 2, d = 2, h, z = 0 } = b
    const pal = b.c ? tint(b.c) : NEUTRAL
    const z1 = z + h
    const wx = h2(w * A), wy = h2(w * A / 2), dx = h2(d * A), dy = h2(d * A / 2), hh = h2(h * A)
    let s = ''
    s += `<path d="M${P(x, y + d, z)}l${wx} ${wy}v-${hh}l-${wx}-${wy}z" fill="${pal.left}"/>`
    s += `<path d="M${P(x + w, y, z)}l-${dx} ${dy}v-${hh}l${dx}-${dy}z" fill="${pal.right}"/>`
    s += `<path d="M${P(x, y, z1)}l${wx} ${wy}l-${dx} ${dy}l-${wx}-${wy}z" fill="${pal.top}"/>`
    s += `<path d="M${P(x, y + d, z1)}l${wx} ${wy}l${dx}-${dy}" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" fill="none" stroke-linejoin="round"/>`
    return { s, pal, top: (dx = w / 2, dy = d / 2) => Pn(x + dx, y + dy, z1) }
  }
  // the building's outline on screen (convex hull of its 8 corners), for working out which windows are hidden
  function hull(b) {
    const { x, y, w = 2, d = 2, h, z = 0 } = b
    const pts = []
    for (const a of [x, x + w]) for (const c of [y, y + d]) for (const e of [z, z + h]) pts.push(Pn(a, c, e))
    pts.sort((p, q) => p[0] - q[0] || p[1] - q[1])
    const cross = (o, a, b2) => (a[0] - o[0]) * (b2[1] - o[1]) - (a[1] - o[1]) * (b2[0] - o[0])
    const lo = [], hi = []
    for (const p of pts) { while (lo.length > 1 && cross(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p) }
    for (const p of [...pts].reverse()) { while (hi.length > 1 && cross(hi.at(-2), hi.at(-1), p) <= 0) hi.pop(); hi.push(p) }
    return lo.slice(0, -1).concat(hi.slice(0, -1))
  }
  // windows: small parallelograms on both front faces; each carries its corners for the hidden-window test
  function windows(b) {
    const { x, y, w = 2, d = 2, h, z = 0 } = b
    const out = []
    const rows = Math.floor((h - 0.6) / 1.1)
    const ux = h2(0.5 * A), uy = h2(0.25 * A), up = h2(0.55 * A)
    for (let r = 0; r < rows; r++) {
      const z0 = z + 0.6 + r * 1.1
      for (const t of [0.3, 1.1]) {
        const a = Pn(x + t, y + d, z0), c = Pn(x + w, y + t, z0)
        out.push({ d: `M${a.join(' ')}l${ux} ${uy}v-${up}l-${ux}-${uy}z`, pts: [a, [a[0] + ux, a[1] + uy], [a[0] + ux, a[1] + uy - up], [a[0], a[1] - up]] })
        out.push({ d: `M${c.join(' ')}l-${ux} ${uy}v-${up}l${ux}-${uy}z`, pts: [c, [c[0] - ux, c[1] + uy], [c[0] - ux, c[1] + uy - up], [c[0], c[1] - up]] })
      }
    }
    return out
  }
  return { P, Pn, poly, box, hull, windows }
}
// strictly inside a convex polygon (counter-clockwise or clockwise), with a half-pixel margin
function inside(p, poly) {
  let sign = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]
    const c = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    if (Math.abs(c / len) < 0.5) return false
    const s = Math.sign(c)
    if (sign && s !== sign) return false
    sign = s
  }
  return true
}

// ---------- shared CSS inside each SVG ----------
const POP = 'cubic-bezier(.34,1.56,.64,1)'
const SCENE_CSS = `
.b{transform-box:fill-box;transform-origin:50% 100%;animation:pop .7s ${POP} both}
@keyframes pop{0%{transform:scale(.15);opacity:0}60%{opacity:1}100%{transform:scale(1);opacity:1}}
.tw{animation:tw 9s ease-in-out infinite;opacity:0}
@keyframes tw{0%,62%,100%{opacity:0}70%,88%{opacity:.95}}
.lit{animation:lit 1.6s ease-in-out infinite alternate}
@keyframes lit{from{opacity:.35}to{opacity:1}}
.blk{transform-box:fill-box;transform-origin:50% 100%;animation:blk 6s ${POP} infinite both}
@keyframes blk{0%{transform:scale(.1);opacity:0}9%{transform:scale(1);opacity:1}78%{transform:scale(1);opacity:1}90%,100%{transform:scale(.9);opacity:0}}
.pk{animation:pk 3.2s ease-out infinite both}
@keyframes pk{0%{transform:translateY(6px);opacity:0}20%{opacity:.9}100%{transform:translateY(-46px);opacity:0}}
.fl{animation:fl 8s ease-in-out infinite alternate}
@keyframes fl{from{transform:translateY(0)}to{transform:translateY(-10px)}}
`
// each layer carries only the motion rules it uses
const pick = re => SCENE_CSS.split('\n').filter(l => re.test(l)).join('\n')
const RM = '@media (prefers-reduced-motion:reduce){.b,.blk,.pk,.fl,.tw,.lit{animation:none!important}.tw,.pk{opacity:0!important}}'
const IDLE_CSS = () => pick(/^\.(b|tw)\{|keyframes (pop|tw)/) + RM
const BUSY_CSS = () => pick(/^\.(lit|blk|pk)\{|keyframes (lit|blk|pk)/) + RM
const FL_CSS = () => pick(/^\.fl\{|keyframes fl/) + RM

const svgDoc = (w, h, body, css) =>
  `<svg ${NS} viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><style>${css}</style>${body}</svg>`

const mini = (I, x, y, z, c, s = 0.8) => I.box({ x, y, z, w: s, d: s, h: s, c }).s

// ---------- a cluster: idle layer (buildings, slow twinkle) and busy layer (lit windows, a building going up, data) ----------
const W = 360, H = 250
function cluster({ ox, oy, A, lots, site, chars, flip }) {
  const I = iso(ox, oy, A)
  const order = [...lots].sort((a, b) => (a.x + a.y) - (b.x + b.y))
  const hulls = order.map(b => I.hull(b))
  let idle = '', busy = ''
  // ground slab, very quiet
  const gx0 = -0.5, gx1 = 7.3
  idle += I.poly([I.P(gx0, gx0, 0), I.P(gx1, gx0, 0), I.P(gx1, gx1, 0), I.P(gx0, gx1, 0)], '#d9d5e6', ' opacity=".35"')
  const roofs = {}
  order.forEach((b, i) => {
    const bx = I.box(b)
    const wins = I.windows(b)
    const delay = r1(0.15 + i * 0.09)
    const winIdle = `<path d="${wins.map(w => w.d).join('')}" fill="${bx.pal.win}" opacity=".55"/>`
    // two windows per building warm up now and then, at staggered times
    const tw = wins.filter((_, k) => (k * 7 + i * 3) % 5 === 0).slice(0, 2)
      .map((w, k) => `<path class="tw" style="animation-delay:${r1(1.2 + ((i * 2.3 + k * 4.1) % 9))}s" d="${w.d}" fill="#ffd36e"/>`).join('')
    idle += `<g class="b" style="animation-delay:${delay}s">${bx.s}${winIdle}${tw}</g>`
    // busy: only windows no building in front of them hides, so the busy layer needs no copies of the buildings
    const seen = wins.filter(w => !hulls.slice(i + 1).some(h => w.pts.some(p => inside(p, h))))
    for (const half of [0, 1]) {
      const d = seen.filter((_, k) => k % 2 === half).map(w => w.d).join('')
      if (d) busy += `<path class="lit" style="animation-delay:${r1((i * 0.53 + half * 0.8) % 1.6)}s" d="${d}" fill="#ffd36e"/>`
    }
    if (b.id) roofs[b.id] = bx.top()
  })
  // busy: a little building goes up on the empty site, block by block, and data cubes rise off the roofs
  for (let k = 0; k < 3; k++) {
    const blk = I.box({ x: site.x, y: site.y, z: k * 1.25, w: 1.6, d: 1.6, h: 1.25, c: site.colors[k] })
    busy += `<g class="blk" style="animation-delay:${r1(k * 0.55)}s">${blk.s}</g>`
  }
  Object.values(roofs).forEach(([fx, fy], k) => {
    const c = ['#5b95f2', '#a59cf2', '#e9773f', '#4cc6c1'][k % 4]
    const I2 = iso(fx + (flip ? -14 : 14), fy - 10, 5)
    busy += `<g class="pk" style="animation-delay:${r1(k * 0.8)}s">${mini(I2, 0, 0, 0, c, 1)}</g>`
  })
  return {
    idle: svgDoc(W, H, idle, IDLE_CSS()),
    busy: svgDoc(W, H, busy, BUSY_CSS()),
    // where each cube stands: feet at (fx, fy + 1) in this cluster's 360 x 250 box
    spots: chars.map(c => ({ ...c, fx: roofs[c.on][0], fy: roofs[c.on][1] + 1 })),
  }
}

// left: Cubsy on the tallest tower
const left = cluster({
  ox: 176, oy: 128, A: 14, flip: false,
  lots: [
    { x: 0, y: 0, h: 5.5 },
    { x: 2.4, y: 0, h: 3.5, c: '#5b95f2' },
    { x: 4.8, y: 0, h: 2.2 },
    { x: 0, y: 2.4, h: 3 },
    { x: 2.4, y: 2.4, h: 6.6, id: 'tower' },
    { x: 4.8, y: 2.4, h: 4, c: '#a59cf2' },
    { x: 0, y: 4.8, h: 1.8, c: '#4cc6c1' },
    { x: 2.4, y: 4.8, h: 2.6 },
  ],
  site: { x: 5.0, y: 5.0, colors: ['#f1bc42', '#ef82ba', '#5cc98b'] },
  chars: [{ id: 1, on: 'tower', w: 50, side: 'left', look: [0, 0] }],
})

// right: Maya and Nora, each on her own roof
const right = cluster({
  ox: 184, oy: 128, A: 14, flip: true,
  lots: [
    { x: 0, y: 0, h: 4.2, c: '#e9773f' },
    { x: 2.4, y: 0, h: 6, id: 'east' },
    { x: 4.8, y: 0, h: 2.8 },
    { x: 0, y: 2.4, h: 5.2, id: 'west' },
    { x: 2.4, y: 2.4, h: 2.2, c: '#5cc98b' },
    { x: 4.8, y: 2.4, h: 3.4 },
    { x: 2.4, y: 4.8, h: 1.6 },
    { x: 4.8, y: 4.8, h: 2.4, c: '#5b95f2' },
  ],
  site: { x: 0.2, y: 5.0, colors: ['#a59cf2', '#5ab9ee', '#f1bc42'] },
  chars: [{ id: 2, on: 'east', w: 48, side: 'right', look: [0, 0] }, { id: 3, on: 'west', w: 46, side: 'right', look: content.boss.look || [0, 0] }],
})

// a few tiny cubes drifting near the top corner
const floater = (x, y, c, s, delay, dur) => {
  const I = iso(x, y, 10)
  return `<g class="fl" style="animation-delay:${delay}s;animation-duration:${dur}s">${I.box({ x: 0, y: 0, w: s, d: s, h: s, c }).s}</g>`
}
const floaters = svgDoc(220, 140,
  floater(40, 60, '#a59cf2', 1.1, -2, 9) + floater(120, 30, '#5b95f2', 0.8, -5, 11) + floater(176, 92, '#e9773f', 0.6, -1, 8),
  FL_CSS())

// ---------- encode and write ----------
const min = s => s.replace(/\n\s*/g, '').replace(/\s{2,}/g, ' ').replace(/"/g, "'")
const uri = s => `url("data:image/svg+xml,${min(s).replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}")`

const out = path.join(HERE, 'out')
fs.mkdirSync(out, { recursive: true })
const files = {
  'left-idle': left.idle, 'left-busy': left.busy, 'right-idle': right.idle, 'right-busy': right.busy, floaters,
  'body-cubsy': cubsyBody, 'body-maya': mayaBody, 'body-nora': noraBody,
  'eyes-plain': EYES.plain, 'eyes-kind': EYES.kind, 'eyes-happy': EYES.happy, 'eyes-sad': EYES.sad,
}
for (const [k, v] of Object.entries(files)) fs.writeFileSync(path.join(out, `${k}.svg`), v)
const U = Object.fromEntries(Object.entries(files).map(([k, v]) => [k, uri(v)]))

// ---------- the page side ----------
const AREA = '[data-workspace-area="conversation"]'
const B = `${AREA}::before`
const E = 'cubic-bezier(.2,.8,.2,1)'
// states. Each is a selector for the chat area, wrapped in :where() so they all weigh the same and later rules win.
const st = s => `:where(${s})::before`
const root = s => `:root:has(${s}) ${AREA}`
const BUSY = `${AREA}:has([data-timeline-row-kind="working"])`
// T3 marks a thread "Completed" in the sidebar until you open it; the row's aria-label is "title, status, project"
// the status sits between title and project, so match ", Completed," or a label that ends in it (a title like
// "Notes, Completed work" doesn't match either)
const DONE = `${root('[data-sidebar-row]:is([aria-label*=", Completed,"],[aria-label$=", Completed"])')}`
// sad: the open thread failed (how a provider running out of usage shows up), or T3 fell back to another model
// because the default one is out of usage (only shows when a fallback model is set)
const SAD = `${root('[data-sidebar-row][aria-current="page"]:is([aria-label*=", Failed,"],[aria-label$=", Failed"])')},${root('[aria-label="Dismiss fallback model notice"]')}`
// 'typing' = the composer holds text (tiptap marks an empty paragraph .is-empty)
const TYPING = `${AREA}:has(.composer-tiptap p:not(.is-empty))`
// the cubes themselves are hovered or pressed: the chat area is, but nothing inside it is (the ::after hit area)
const ONCUBE = `${AREA}:hover:not(:has(:hover))`
const PRESS = `${AREA}:active:not(:has(:active))`

// registered properties, so they can animate and transition (all plain numbers)
const PROPS = { p1: 1, p2: 1, p3: 1, y1: 0, y2: 0, y3: 0, q1: 0, q2: 0, q3: 0, lx: 0, rx: 0, gy: 0, done: 0, yay: 0, sad: 0, tap: 0 }
const props = Object.entries(PROPS).map(([k, v]) => `@property --cc-${k}{syntax:'<number>';inherits:false;initial-value:${v}}`).join('')

// a hop curve: three humps that shrink as x runs from 1 to 0 (abs written as max(a,-a))
const hop = x => `max(sin(${x}*3*pi),sin(${x}*-3*pi))*${x}`
const CH = [...left.spots, ...right.spots]
let vars = '', layers = []
for (const c of CH) {
  const i = c.id, k = r3(c.w / 200)
  const ax = r1(c.side === 'left' ? c.fx : W - c.fx)   // foot, from the cluster's outer edge
  const fb = r1(H - c.fy)                               // foot, from the cluster's bottom
  const look = c.side === 'left' ? 'var(--cc-lx)' : 'var(--cc-rx)'
  const sx = c.side === 'left' ? '+' : '-'
  vars += `--w${i}:calc(var(--s)*${c.w}*var(--cc-p${i})*(1 + var(--cc-q${i})*var(--calm) + var(--K)));`
  vars += `--h${i}:calc(var(--s)*${r1(c.w * 1.11)}*var(--cc-p${i})*(1 - var(--cc-q${i})*var(--calm) - var(--K)));`
  vars += `--x${i}:calc(var(--s)*${ax} - 18px - var(--w${i})/2);`
  vars += `--y${i}:calc(4px + var(--s)*${fb} - var(--h${i})*.045 + var(--s)*${k}*var(--cc-p${i})*(var(--cc-y${i})*var(--calm) + var(--J)));`
  vars += `--ex${i}:calc(var(--x${i}) ${sx} var(--s)*${k}*var(--cc-p${i})*(${look} + ${c.look[0]}));`
  vars += `--ey${i}:calc(var(--y${i}) - var(--s)*${k}*var(--cc-p${i})*(var(--cc-gy) + var(--cc-sad)*4 + ${c.look[1]}));`
  const at = c.side
  layers.push([`var(--cc-eh)`, `${at} var(--ex${i}) bottom var(--ey${i})`, `calc(var(--w${i})*var(--G)) calc(var(--h${i})*var(--G))`])
  layers.push([`var(--e${i})`, `${at} var(--ex${i}) bottom var(--ey${i})`, `calc(var(--w${i})*(1 - var(--G))) calc(var(--h${i})*(1 - var(--G)))`])
  layers.push([`var(--cc-b${i})`, `${at} var(--x${i}) bottom var(--y${i})`, `var(--w${i}) var(--h${i})`])
}
const SZ = 'auto var(--cc-h)', FSZ = 'auto calc(var(--cc-h) * .62)'
const LB = 'left -18px bottom 4px', RB = 'right -18px bottom 4px', RT = 'right 36px top 38%'
layers.push(['var(--bl)', LB, SZ], ['var(--cc-li)', LB, SZ], ['var(--br)', RB, SZ], ['var(--cc-ri)', RB, SZ], ['var(--cc-fl)', RT, FSZ])
const col = n => layers.map(l => l[n]).join(',')

// the clickable patch over the cubes (::after): one box over Cubsy, one over Maya and Nora, joined by a zero-width seam
const box = spots => {
  const x0 = Math.min(...spots.map(s => s.fx - s.w / 2 - 4)), x1 = Math.max(...spots.map(s => s.fx + s.w / 2 + 4))
  const b0 = Math.min(...spots.map(s => H - s.fy)), b1 = Math.max(...spots.map(s => H - s.fy + s.w * 1.11))
  return { x0, x1, b0: r1(b0), b1: r1(b1) }
}
const lb = box(left.spots), rb = box(right.spots)
const px = (edge, v) => edge === 'left' ? `calc(var(--s)*${r1(v)} - 18px)` : `calc(100% + 18px - var(--s)*${r1(W - v)})`
const py = v => `calc(100% - 4px - var(--s)*${v})`
const pt = (edge, x, y) => `${px(edge, x)} ${py(y)}`
const L4 = [pt('left', lb.x0, lb.b1), pt('left', lb.x1, lb.b1), pt('left', lb.x1, lb.b0), pt('left', lb.x0, lb.b0)]
const R4 = [pt('right', rb.x0, rb.b1), pt('right', rb.x1, rb.b1), pt('right', rb.x1, rb.b0), pt('right', rb.x0, rb.b0)]
const HIT = `polygon(${[...L4, L4[0], ...R4, R4[0]].join(',')})`

// motion, all on the page clock. Kit idles: Cubsy bobs (2.8s), the two bosses do the boss hop (6s, kit delays 1.4 and 3.1)
const kf = (name, body) => `@keyframes ${name}{${body}}`
const bossHop = n => `0%,38%,62%,100%{--cc-y${n}:0;--cc-q${n}:0}41%{--cc-y${n}:0;--cc-q${n}:.09}47%{--cc-y${n}:16;--cc-q${n}:-.055}53%{--cc-y${n}:0;--cc-q${n}:.075}57%{--cc-y${n}:0;--cc-q${n}:0}`
const KEYS = [
  kf('cc-in', 'from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}'),
  kf('cc-p1', 'from{--cc-p1:0}'), kf('cc-p2', 'from{--cc-p2:0}'), kf('cc-p3', 'from{--cc-p3:0}'),
  kf('cc-b1', 'to{--cc-y1:5}'),
  kf('cc-h2', bossHop(2)), kf('cc-h3', bossHop(3)),
].join('')
// landing after the buildings (1.0s), 0.18s apart, like the first version
// The idle bob and boss hops run forever and cost about 4x the CPU of everything else, so the calm build leaves them out.
// The power helper (power/) swaps between the two: lively on the charger, calm on battery.
const animFor = calm => [`cc-in .6s ${E} backwards`, `cc-p1 .8s ${POP} 1s backwards`, `cc-p2 .8s ${POP} 1.2s backwards`, `cc-p3 .8s ${POP} 1.4s backwards`,
  ...(calm ? [] : ['cc-b1 2.8s ease-in-out infinite alternate', 'cc-h2 6s linear -1.4s infinite', 'cc-h3 6s linear -3.1s infinite'])].join(',')

const make = calm => `/* Cube City${calm ? ' (calm)' : ''}: an Agnostify cube city in the corners of the chat, with moods. Built by build.mjs. */
${props}
${AREA}{position:relative;isolation:isolate;container-type:inline-size;--cc-li:${U['left-idle']};--cc-lb:${U['left-busy']};--cc-ri:${U['right-idle']};--cc-rb:${U['right-busy']};--cc-fl:${U.floaters};--cc-b1:${U['body-cubsy']};--cc-b2:${U['body-maya']};--cc-b3:${U['body-nora']};--cc-ep:${U['eyes-plain']};--cc-ek:${U['eyes-kind']};--cc-eh:${U['eyes-happy']};--cc-es:${U['eyes-sad']}}
${B},${AREA}::after{--cc-h:clamp(130px,23vh,220px);--s:calc(var(--cc-h)/250);content:"";position:absolute;inset:0;pointer-events:none}
${st(AREA)}{z-index:-1;background-repeat:no-repeat;--e1:var(--cc-ep);--e2:var(--cc-ek);--e3:var(--cc-eh);--bl:none;--br:none;--cc-lx:2;--cc-rx:-2;--td:1.8s;--ty:0s;--tt:.65s;--tf:cubic-bezier(.55,0,.5,1.45);--calm:calc(1 - var(--cc-sad)*.8);--G:clamp(0,(var(--cc-done)*(1 - var(--cc-done)) + var(--cc-yay) + max(var(--cc-tap),0))*1e5,1);--J:calc((${hop('var(--cc-done)')} + ${hop('(1 - var(--cc-yay))')})*40 + max(var(--cc-tap),0)*64);--K:calc(var(--cc-sad)*.09 + max(0,0 - var(--cc-tap))*.6);${vars}background-image:${col(0)};background-position:${col(1)};background-size:${col(2)};transition:transform .3s ${E},opacity .3s ${E},--cc-lx .4s ${E},--cc-rx .4s ${E},--cc-gy .4s ${E},--cc-sad .8s ${E},--cc-done var(--td) linear,--cc-yay var(--ty) linear,--cc-tap var(--tt) var(--tf);animation:${animFor(calm)}}
${AREA}::after{z-index:1;cursor:pointer;clip-path:${HIT}}
${st(BUSY)}{--bl:var(--cc-lb);--br:var(--cc-rb);--cc-done:1;--td:0s}
${st(DONE)}{--cc-yay:1;--ty:1.6s}
${st(SAD)}{--cc-sad:1;--e1:var(--cc-es);--e2:var(--cc-es);--e3:var(--cc-es);--cc-done:0;--td:0s;--cc-yay:0;--ty:0s}
${st(root('.messages-timeline-scroll:hover'))}{--cc-lx:5;--cc-rx:-5;--cc-gy:-5}
${st(root('[data-chat-header]:hover'))}{--cc-lx:3;--cc-rx:-3;--cc-gy:-8}
${st(root('[data-slot="sidebar"]:hover'))}{--cc-lx:-8;--cc-rx:-8;--cc-gy:-2}
${st(root('[data-thread-details-card]:hover,[data-thread-terminal-drawer]:hover'))}{--cc-lx:8;--cc-rx:8;--cc-gy:-2}
${st(`${TYPING},${root('[data-chat-composer-form]:hover')}`)}{--cc-lx:7;--cc-rx:-7;--cc-gy:2}
${st(ONCUBE)}{--cc-lx:0;--cc-rx:0;--cc-gy:3}
${st(PRESS)}{--cc-tap:1;--tt:.14s;--tf:ease-out}
${st(TYPING)}{transform:translateY(-6px)}
${KEYS}
.dark ${B}{opacity:.78}
@container (max-width:1100px){${B}{opacity:.5;--cc-h:150px}}
@container (min-width:1540px){${AREA}::after{pointer-events:auto}}
@container (max-width:900px){${B}{display:none}}
@media (prefers-reduced-motion:reduce){${B}{animation:none;transition:none}}
`
for (const [file, calm] of [['theme.css', false], ['theme-calm.css', true]]) {
  const css = make(calm)
  if (css.includes('\\')) throw new Error('T3 refuses theme CSS with a backslash')
  if (css.length > 50000) throw new Error(`${file} is ${css.length} chars, over T3's 50,000 limit`)
  fs.writeFileSync(path.join(out, file), css)
  // the same build as a ready T3 theme file (t3 theme set out/cube-city.json). Both keep the id and name Cube City.
  const theme = { name: 'Cube City', appearance: 'light', canvas: '#fcfcfc', accent: '#1b4ed8', variants: { dark: { canvas: '#151517', accent: '#346bf1' } }, css }
  fs.writeFileSync(path.join(out, calm ? 'cube-city-calm.json' : 'cube-city.json'), JSON.stringify(theme, null, 2) + String.fromCharCode(10))
  console.log(file.padEnd(15), 'chars:', css.length, '(limit 50000)')
}
for (const [k, v] of Object.entries(U)) console.log(k.padEnd(12), v.length)
