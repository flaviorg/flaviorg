// Renders section-*.png at 2x. Run: node render-sections.mjs [mods|projects|stack|contact ...] [--light]  (or THEME=light)
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
const require = createRequire('/Users/flaviogouveia/.claude/skills/motion-studio/scripts/package.json')
const { chromium } = require('playwright')
const here = dirname(fileURLToPath(import.meta.url))
const LIGHT = process.env.THEME === 'light' || process.argv.includes('--light')
const SUF = LIGHT ? '-light' : '', Q = LIGHT ? '?theme=light' : ''
const names = process.argv.slice(2).filter((a) => !a.startsWith('--')).length ? process.argv.slice(2).filter((a) => !a.startsWith('--')) : ['mods', 'projects', 'stack', 'contact']

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 })
for (const n of names) {
  await page.goto(pathToFileURL(resolve(here, `section-${n}.html`)).href + Q)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle')
  const box = await page.locator('#sec').boundingBox()
  await page.locator('#sec').screenshot({ path: resolve(here, `section-${n}${SUF}.png`) })
  console.log(`section-${n}${SUF}.png ${box.width}x${box.height}`)
}
await browser.close()
