// Renders one PNG per badge at 2x. Run: node render-badges.mjs [--light]  (or THEME=light)
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
const require = createRequire('/Users/flaviogouveia/.claude/skills/motion-studio/scripts/package.json')
const { chromium } = require('playwright')
const here = dirname(fileURLToPath(import.meta.url))
const LIGHT = process.env.THEME === 'light' || process.argv.includes('--light')
const SUF = LIGHT ? '-light' : '', Q = LIGHT ? '?theme=light' : ''

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 800, height: 1400 }, deviceScaleFactor: 2 })
await page.goto(pathToFileURL(resolve(here, 'badges.html')).href + Q)
await page.evaluate(() => document.fonts.ready)
for (const id of ['website', 'linkedin', 'email', 'freelance', 'repo-tripwire', 'repo-canopy', 'repo-crew', 'repo-claude-mods', 'repo-incident-copilot', 'repo-agent-flight-recorder', 'repo-legacy-archaeologist', 'repo-secure-legacy-mcp', 'repo-docs-data-assistant', 'repo-a11y-fixgate', 'repo-privacy-radar', 'repo-maestri-squad', 'repo-motion-studio', 'repo-reelforge']) {
  await page.locator('#' + id).screenshot({ path: resolve(here, `badge-${id}${SUF}.png`), omitBackground: true })
  console.log(`badge-${id}${SUF}.png`)
}
await browser.close()
