// CPU cost of each build in the stand-in page: main-thread task seconds over 10 seconds, idle.
// Run from cube-city/: node tools/perf.mjs  (needs playwright-core next to it and Google Chrome)
import { chromium } from 'playwright-core'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const builds = { lively: 'out/theme.css', calm: 'out/theme-calm.css' }
if (fs.existsSync('out/theme-v1.css')) builds.v1 = 'out/theme-v1.css'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
for (const [name, css] of Object.entries(builds)) {
  const html = `out/perf-${name}.html`
  execFileSync('node', ['harness.mjs', css, html])
  const runs = []
  for (let i = 0; i < 2; i++) {
    const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 })
    const c = await p.context().newCDPSession(p); await c.send('Performance.enable')
    await p.goto('file://' + fs.realpathSync(html)); await p.waitForTimeout(3000)
    const get = async () => Object.fromEntries((await c.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]))
    const m0 = await get(); await p.waitForTimeout(10000); const m1 = await get()
    runs.push((m1.TaskDuration - m0.TaskDuration).toFixed(2))
    await p.close()
  }
  console.log(name.padEnd(7), 'task seconds per 10s:', runs.join(', '))
}
await b.close()
