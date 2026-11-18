import { chromium } from 'playwright-core'
const OUT = process.env.HOME + '/Developer/t3-mods/cube-city/out/shots/'
const URL = 'file://' + process.env.HOME + '/Developer/t3-mods/cube-city/out/harness.html'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const p = await b.newPage({ viewport: { width: 1900, height: 900 }, deviceScaleFactor: 2 })
const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text()))
const wait = ms => p.waitForTimeout(ms)
const corners = async name => {
  await p.screenshot({ path: OUT + name + '-L.png', clip: { x: 250, y: 560, width: 340, height: 340 } })
  await p.screenshot({ path: OUT + name + '-R.png', clip: { x: 1560, y: 560, width: 340, height: 340 } })
}
await p.goto(URL); await p.mouse.move(1, 1); await wait(3200)
const info = await p.evaluate(() => {
  const a = document.querySelector('[data-workspace-area="conversation"]'); const s = getComputedStyle(a, '::before')
  return { layers: s.backgroundImage.split('url(').length - 1, size: s.backgroundSize.slice(0, 200), pos: s.backgroundPosition.slice(0, 160), anim: s.animationName, p1: s.getPropertyValue('--cc-p1'), G: s.getPropertyValue('--G') }
})
console.log(JSON.stringify(info, null, 1))
await p.screenshot({ path: OUT + 'full-idle.png' })
await corners('idle')
await p.mouse.move(130, 300); await wait(600); await corners('look-sidebar')
await p.mouse.move(850, 820); await wait(600); await corners('look-composer')
await p.mouse.move(850, 20); await wait(600); await corners('look-header')
// hover a cube: Cubsy sits about 140px in from the chat's left edge, 175px up
const cub = await p.evaluate(() => { const r = document.querySelector('[data-workspace-area="conversation"]').getBoundingClientRect(); return { x: r.left + 137, y: r.bottom - 175 } })
await p.mouse.move(cub.x, cub.y); await wait(600); await corners('look-you')
const hov = await p.evaluate(() => document.querySelector('[data-workspace-area="conversation"]').matches(':hover:not(:has(:hover))'))
console.log('cube hover detected:', hov)
await p.mouse.down(); await wait(120); await corners('press'); await p.mouse.up(); await wait(560); await corners('land'); await wait(800)
await p.mouse.move(850, 400)
await p.evaluate(() => set('busy', true)); await wait(1500); await corners('busy')
await p.evaluate(() => set('busy', false)); await wait(260); await corners('cheer1'); await wait(300); await corners('cheer2'); await wait(2000); await corners('after-cheer')
await p.evaluate(() => set('done', true)); await wait(2200); await corners('excited')
await p.evaluate(() => set('done', false)); await p.evaluate(() => set('failed', true)); await wait(1200); await corners('sad')
await p.evaluate(() => { set('failed', false); set('dark', true); set('busy', true) }); await wait(1500); await corners('dark-busy')
await p.screenshot({ path: OUT + 'full-dark-busy.png' })
console.log('errors:', errs)
await b.close()
