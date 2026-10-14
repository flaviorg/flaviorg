// Renders hero.gif (1600 px, 20 fps, 6 s loop) + hero-still.png (2x full state) via hero.html's __t hook.
// Run: node hero-gif.mjs [--light]  (or THEME=light -> hero-light.gif + hero-still-light.png)
import { createRequire } from 'node:module'
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve, join } from 'node:path'
const require = createRequire('/Users/flaviogouveia/.claude/skills/motion-studio/scripts/package.json')
const { chromium } = require('playwright')
const here = dirname(fileURLToPath(import.meta.url))
const LIGHT = process.env.THEME === 'light' || process.argv.includes('--light')
const SUF = LIGHT ? '-light' : '', Q = LIGHT ? '?theme=light' : ''
const FPS = +(process.env.FPS || 20)
const frames = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'hero-frames-'))

const browser = await chromium.launch()
const open = async (dpr) => {
  const page = await browser.newPage({ viewport: { width: 1600, height: 800 }, deviceScaleFactor: dpr })
  await page.goto(pathToFileURL(resolve(here, 'hero.html')).href + Q)
  await page.evaluate(() => document.fonts.ready)
  return page
}
const page = await open(1)
const loop = await page.evaluate(() => window.LOOP)
const n = Math.round((loop / 1000) * FPS)
for (let i = 0; i < n; i++) {
  await page.evaluate((ms) => window.__t(ms), (i * 1000) / FPS)
  await page.locator('#hero').screenshot({ path: join(frames, `f${String(i).padStart(4, '0')}.png`) })
}
const still = await open(2)
await still.evaluate(() => window.__t(window.STILL_T))
await still.locator('#hero').screenshot({ path: resolve(here, `hero-still${SUF}.png`) })
await browser.close()

const out = resolve(here, `hero${SUF}.gif`)
execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(FPS), '-i', join(frames, 'f%04d.png'),
  '-filter_complex', '[0:v]split[a][b];[a]palettegen=max_colors=256:stats_mode=full:reserve_transparent=0[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle',
  '-loop', '0', out], { stdio: 'inherit' })
if (process.env.KEEP) console.log('frames kept in', frames); else rmSync(frames, { recursive: true })
console.log(`hero${SUF}.gif ${n} frames @ ${FPS} fps = ${loop / 1000} s, ${(statSync(out).size / 1048576).toFixed(2)} MB`)
