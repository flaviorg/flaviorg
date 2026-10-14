// Generates the four crew mascots (pose "working") from crew's own sprites.ts.
// Run: node sprites.mts   (Node >= 23 strips types)   or   bun sprites.mts
import { writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
const here = dirname(fileURLToPath(import.meta.url))
const s = await import(pathToFileURL(resolve(here, '../crew/hooks/sprites.ts')).href)

// a custom agent type name that lands on the gold coat (#E9B248)
let customType = 'video'
for (const n of ['video', 'motion', 'studio', 'reel', 'media', 'film', 'render', 'clip']) {
  if (s.paletteFor(n, 'working').b === '#E9B248') { customType = n; break }
}
const agents = { general: 'general-purpose', explore: 'Explore', plan: 'Plan', custom: customType }
const out: Record<string, { svg: string; body: string }> = {}
for (const [kind, type] of Object.entries(agents)) {
  const pal = s.paletteFor(type, 'working')
  out[kind] = { svg: s.spriteSvg(kind, 'working', pal, 8), body: pal.b }
}
writeFileSync(resolve(here, 'sprites.json'), JSON.stringify({ customType, ...out }, null, 1))
console.log('custom type:', customType, Object.values(out).map((o) => o.body))
