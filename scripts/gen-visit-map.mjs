/**
 * Генерирует src/data/visit-map.json — собственную векторную карту окрестностей
 * салона (ул. Братьев Кашириных, 131Б) для футера и страницы контактов.
 * Вместо скриншота Яндекс Карт и тяжёлого iframe: геометрия по слоям (классам)
 * и подписи улиц, цвета подставляет src/lib/salon-map.ts из дизайн-системы.
 *
 * Данные — OpenStreetMap (© участники OpenStreetMap, ODbL) через Overpass API.
 *
 * Запуск:   node scripts/gen-visit-map.mjs
 *           node scripts/gen-visit-map.mjs --from osm.json   (готовый ответ Overpass)
 * Когда запускать снова: если координаты салона в src/lib/contacts-data.ts
 * (address.coordinates) поменялись.
 */
import { readFile, writeFile } from 'node:fs/promises'

const ROOT = new URL('../', import.meta.url)
const src = await readFile(new URL('src/lib/contacts-data.ts', ROOT), 'utf8')
const m = src.match(/coordinates:\s*\{\s*lat:\s*([\d.]+),\s*lng:\s*([\d.]+)/)
if (!m) throw new Error('Не нашёл address.coordinates в contacts-data.ts')
const LAT0 = Number(m[1])
const LNG0 = Number(m[2])

/* Холст 1000×720 единиц, 1 единица = 1,5 м → видно 1,5 × 1,1 км */
const W = 1000
const H = 720
const M_PER_UNIT = 1.5
const R = 6378137
const rad = (d) => (d * Math.PI) / 180
const project = (lat, lon) => [
  W / 2 + (rad(lon - LNG0) * Math.cos(rad(LAT0)) * R) / M_PER_UNIT,
  H / 2 - (rad(lat - LAT0) * R) / M_PER_UNIT,
]

/* bbox с запасом на поля */
const dLat = ((H / 2) * M_PER_UNIT * 1.15) / R * (180 / Math.PI)
const dLng = dLat * (W / H) / Math.cos(rad(LAT0))
const B = [LAT0 - dLat, LNG0 - dLng, LAT0 + dLat, LNG0 + dLng].map((n) => n.toFixed(5)).join(',')

const query = `[out:json][timeout:90];(
  way[highway](${B}); way[railway~"^(rail|subway|light_rail)$"](${B});
  way[building](${B}); way[landuse~"^(forest|grass|meadow|recreation_ground)$"](${B});
  way[leisure~"^(park|garden)$"](${B}); way[natural~"^(wood|water|scrub)$"](${B});
  way[waterway~"^(river|stream)$"](${B});
);out geom;`

/* Overpass часто отвечает 504 под нагрузкой — до трёх попыток */
async function overpass() {
  const from = process.argv.indexOf('--from')
  if (from > 0) return JSON.parse(await readFile(process.argv[from + 1], 'utf8'))
  for (let i = 1; ; i++) {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'User-Agent': 'vfd74 map generator', Accept: '*/*' },
      body: new URLSearchParams({ data: query }),
    })
    if (res.ok) return res.json()
    if (i === 3) throw new Error(`Overpass: HTTP ${res.status}`)
    await new Promise((r) => setTimeout(r, 5000 * i))
  }
}
const { elements } = await overpass()

/* Здание салона — то, внутри которого точка адреса (иначе ближайшее к ней) */
const inside = (pts, x, y) => {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}
const buildings = elements
  .filter((e) => e.tags?.building && e.geometry)
  .map((e) => ({ id: e.id, pts: e.geometry.map((g) => project(g.lat, g.lon)) }))
const centroid = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
let salon = buildings.find((b) => inside(b.pts, W / 2, H / 2))
if (!salon) {
  const near = buildings
    .map((b) => ({ b, d: Math.hypot(...centroid(b.pts).map((v, i) => v - [W / 2, H / 2][i])) }))
    .sort((a, b) => a.d - b.d)[0]
  if (near && near.d < 40) salon = near.b
}
console.log('здание салона:', salon ? `way ${salon.id}` : 'не найдено — подсветки не будет')

/* Слой по тегам. Пешеходные дорожки и дворовые проезды не рисуем — шум */
const MAJOR = /^(motorway|trunk|primary|secondary)(_link)?$/
const MINOR = /^(tertiary|tertiary_link|residential|unclassified|living_street|pedestrian)$/
function layer(e) {
  const t = e.tags ?? {}
  if (t.building) return salon && e.id === salon.id ? 'salon' : 'building'
  if (t.natural === 'water' || t.waterway) return t.waterway ? 'river' : 'water'
  if (t.landuse || t.leisure || t.natural) return 'green'
  if (t.railway) return t.service ? null : 'rail'
  if (t.highway && MAJOR.test(t.highway)) return 'major'
  if (t.highway && MINOR.test(t.highway)) return 'minor'
  return null
}
const CLOSED = new Set(['building', 'salon', 'water', 'green'])

/* Точки ближе 2 единиц (3 м) друг к другу выбрасываем */
function toPath(pts, closed) {
  const out = []
  for (const p of pts) {
    const q = out[out.length - 1]
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) >= 2) out.push(p)
  }
  if (out.length < 2) return ''
  const inView = out.some(([x, y]) => x > -50 && x < W + 50 && y > -50 && y < H + 50)
  if (!inView) return ''
  return 'M' + out.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join('L') + (closed ? 'Z' : '')
}

const layers = { green: [], water: [], river: [], building: [], minor: [], rail: [], major: [], salon: [] }
const named = new Map() // имя улицы → её отрезки (way)
for (const e of elements) {
  const t = e.tags ?? {}
  const l = layer(e)
  if (!l || !e.geometry) continue
  const pts = e.geometry.map((g) => project(g.lat, g.lon))
  const d = toPath(pts, CLOSED.has(l))
  if (!d) continue
  layers[l].push(d)
  if ((l === 'major' || l === 'minor') && t.name) {
    if (!named.has(t.name)) named.set(t.name, [])
    named.get(t.name).push({ pts, major: l === 'major' })
  }
}

/* Подпись улицы — в середине её самого длинного отрезка, попавшего в кадр
   (не у края и не под меткой салона), по направлению улицы; угол приведён
   к −90…90°, чтобы текст не шёл вверх ногами */
const length = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0)
function midpoint(pts) {
  const half = length(pts) / 2
  let acc = 0
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]]
    const seg = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (acc + seg >= half) {
      const k = (half - acc) / seg
      let angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
      if (angle > 90) angle -= 180
      if (angle < -90) angle += 180
      return { x: ((a[0] + (b[0] - a[0]) * k) / W) * 100, y: ((a[1] + (b[1] - a[1]) * k) / H) * 100, angle: Math.round(angle) }
    }
    acc += seg
  }
}
const SHORT = [[/^улица /, 'ул. '], [/ улица$/, ' ул.'], [/^проспект /, 'пр-т '], [/ проспект$/, ' пр-т'], [/ шоссе$/, ' ш.'], [/ проезд$/, ' пр.'], [/^проезд /, 'пр. '], [/^переулок /, 'пер. '], [/ переулок$/, ' пер.']]
const labels = [...named.entries()].flatMap(([name, ways]) => {
  const fit = ways
    .filter((w) => length(w.pts) > 90)
    .map((w) => ({ ...w, len: length(w.pts), at: midpoint(w.pts) }))
    .filter(({ at }) => at.x > 10 && at.x < 90 && at.y > 24 && at.y < 76 && Math.hypot(at.x - 50, at.y - 50) > 8)
    // подпись целиком в кадре: ~13 единиц на символ (19px, semibold), с полем 20 единиц
    .filter(({ at }) => {
      const half = (SHORT.reduce((t, [re, r]) => t.replace(re, r), name).length * 13) / 2
      const hx = half * Math.abs(Math.cos((at.angle * Math.PI) / 180))
      const hy = half * Math.abs(Math.sin((at.angle * Math.PI) / 180))
      const [x, y] = [(at.x / 100) * W, (at.y / 100) * H]
      return x - hx > 20 && x + hx < W - 20 && y - hy > 20 && y + hy < H - 20
    })
    .sort((a, b) => b.len - a.len)
  // Сначала — средняя полоса по высоте: на страницах карта обрезана сверху и снизу (object-cover), поэтому подписи — только из средней полосы 24–76%
  const best = fit.find(({ at }) => at.y > 30 && at.y < 70) ?? fit[0]
  if (!best) return []
  const text = SHORT.reduce((s, [re, r]) => s.replace(re, r), name)
  return [{ text, x: +best.at.x.toFixed(2), y: +best.at.y.toFixed(2), angle: best.at.angle, major: best.major }]
})

const out = {
  attribution: '© участники OpenStreetMap',
  width: W,
  height: H,
  layers: Object.fromEntries(Object.entries(layers).map(([k, v]) => [k, v.join('')])),
  labels,
}
await writeFile(new URL('src/data/visit-map.json', ROOT), JSON.stringify(out))
console.log('visit-map.json:', JSON.stringify(out).length, 'байт;', labels.map((l) => l.text).join(', '))
