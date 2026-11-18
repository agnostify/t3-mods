import { chromium } from 'playwright-core'
import fs from 'node:fs'
const D = process.env.HOME + '/Developer/t3-mods/cube-city/out/shots/'
const rows = [['idle','Normal'],['look-sidebar','Mouse on the sidebar'],['look-composer','Mouse on the message box'],['look-you','Mouse on the cubes'],['press','You click a cube'],['cheer1','A task just finished'],['excited','Finished work waiting'],['sad','Thread failed or usage out']]
const crop = (f, x, y) => `<i style="background-image:url('${D}${f}');background-position:-${x*2}px -${y*2}px"></i>`
const cells = rows.map(([r, t]) => `<div><b>${t}</b>${crop(r + '-L.png', 85, 135)}${crop(r + '-R.png', 160, 130).replace('<i ', '<i class=w ')}</div>`).join('')
fs.writeFileSync(D + 'sheet2.html', `<style>body{margin:0;padding:12px;font:600 15px system-ui;display:grid;grid-template-columns:repeat(4,1fr);gap:16px;background:#fbfaf8;color:#1d1c22;width:1360px}b{display:block;margin-bottom:6px}i{display:inline-block;width:160px;height:160px;background-size:680px 680px;background-repeat:no-repeat;border-radius:12px;margin-right:6px}i.w{width:240px}</style>${cells}`)
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const p = await b.newPage({ viewport: { width: 1384, height: 400 }, deviceScaleFactor: 1 })
await p.goto('file://' + D + 'sheet2.html'); await p.waitForTimeout(300)
await p.screenshot({ path: D + 'moods.png', fullPage: true })
await b.close()
