// Renders hero.png and band.png at 2x. Run: node sprites.mts && node render.mjs  (light: THEME=light or --light -> *-light.png)
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
const require = createRequire('/Users/flaviogouveia/.claude/skills/motion-studio/scripts/package.json')
const { chromium } = require('playwright')
const here = dirname(fileURLToPath(import.meta.url))
const LIGHT = process.env.THEME === 'light' || process.argv.includes('--light')
const SUF = LIGHT ? '-light' : '', Q = LIGHT ? '?theme=light' : ''

const sprites = JSON.parse(readFileSync(resolve(here, 'sprites.json'), 'utf8'))
writeFileSync(resolve(here, 'sprites.js'), `window.SPRITES = ${JSON.stringify(sprites)}\n`)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 800 }, deviceScaleFactor: 2 })
for (const [file, sel, out] of [['hero.html', '#hero', 'hero.png'], ['band.html', '#band', 'band.png']]) {
  await page.goto(pathToFileURL(resolve(here, file)).href + Q)
  await page.evaluate(() => document.fonts.ready)
  await page.addStyleTag({ content: '*{animation-play-state:paused!important}' })
  const fam = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family))
  const o = out.replace('.png', SUF + '.png')
  await page.locator(sel).screenshot({ path: resolve(here, o), omitBackground: false })
  console.log(o, 'fonts loaded:', fam.join(','))
}
await browser.close()
