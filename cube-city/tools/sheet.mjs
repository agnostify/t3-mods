import { chromium } from 'playwright-core'
const D = process.env.HOME + '/Developer/t3-mods/cube-city/out/shots/'
const rows = process.argv[2].split(',')
const out = process.argv[3]
const side = process.argv[4] || 'LR'
const cells = rows.map(r => `<div><b>${r}</b>${[...side].map(s => `<img src="file://${D}${r}-${s}.png">`).join('')}</div>`).join('')
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const p = await b.newPage({ viewport: { width: 1400, height: 400 } })
const fsx = await import('node:fs'); fsx.writeFileSync(D + 'sheet.html', `<style>body{margin:0;font:13px system-ui;display:flex;flex-wrap:wrap;background:#fff}div{width:${side.length*340}px;padding:4px}img{width:340px;height:340px}b{display:block}</style>${cells}`); await p.goto('file://' + D + 'sheet.html')
await p.waitForTimeout(300)
await p.screenshot({ path: D + out, fullPage: true })
await b.close()
