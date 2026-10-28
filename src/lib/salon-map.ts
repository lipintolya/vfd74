/**
 * Собственная векторная карта окрестностей салона (ул. Братьев Кашириных,
 * 131Б) — вместо скриншота Яндекс Карт и iframe. Геометрия — OpenStreetMap
 * (src/data/visit-map.json, scripts/gen-visit-map.mjs), цвета — палитра сайта.
 *
 * Отдаётся как отдельные SVG-файлы (src/pages/salon-map-*.svg.ts), а не
 * inline: футер есть на всех ~400 страницах, картинка кешируется браузером
 * один раз. В <img> не видны CSS-переменные и веб-шрифты, поэтому цвета
 * подставляются при сборке, шрифт — системный (им набраны только подписи улиц).
 *
 * В файле — только геометрия и подписи улиц. Метка салона (с пульсом),
 * карточка с названием и плашки ориентиров — живой HTML поверх, в
 * components/ui/SalonMap.vue: шрифты сайта, появление и пульс по скроллу.
 * Здесь они лишь резервируют место, чтобы подписи улиц их не закрывали.
 *
 * Варианты: dark — футер (графит), light — страница контактов (светлая).
 */
import map from '../data/visit-map.json'

export type SalonMapVariant = 'light' | 'dark'

const PALETTES = {
  light: {
    bg: '#f8fafc', green: '#e6f2ec', water: '#d9e6f2', building: '#e2e8f0',
    roadCasing: '#cbd5e1', road: '#ffffff', rail: '#94a3b8', salon: '#0d9488',
    landmark: '#b6c2d1', label: '#64748b', halo: '#f8fafc', signal: '#14b8a6', ink: '#0f172a',
    card: '#ffffff', cardStroke: '#e2e8f0',
  },
  dark: {
    bg: '#18181a', green: '#1e1e21', water: '#1f2937', building: '#232227',
    roadCasing: '#18181a', road: '#34343a', rail: '#52525b', salon: '#14b8a6',
    landmark: '#3f3f46', label: '#8b8b94', halo: '#18181a', signal: '#2dd4bf', ink: '#ffffff',
    card: '#232227', cardStroke: '#3f3f46',
  },
} as const

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

export function salonMapSvg(variant: SalonMapVariant): string {
  const C = PALETTES[variant]
  const { width: W, height: H, layers: L } = map
  const cx = W / 2
  const cy = H / 2

  /* Тёмная карта — широкая полоса вокруг метки (футер ~3:1): подписи вне
     полосы или торчащие за её край не рисуем — иначе их обрезало бы. */
  const bandH = variant === 'dark' ? 360 : H
  const bandTop = (H - bandH) / 2
  const fits = (x: number, y: number, text: string, angle: number) => {
    const half = (text.length * 11) / 2
    const hx = half * Math.abs(Math.cos((angle * Math.PI) / 180))
    const hy = half * Math.abs(Math.sin((angle * Math.PI) / 180)) + 10
    return x - hx > 15 && x + hx < W - 15 && y - hy > bandTop + 6 && y + hy < bandTop + bandH - 6
  }

  // Плашки ориентиров (Лента Гипер) рисует SalonMap.vue — здесь только занимаем место
  type Box = [number, number, number, number]
  const taken: Box[] = []
  for (const m of map.landmarks) {
    const w = m.text.length * 13 + 30
    const x = (m.x / 100) * W
    const y = (m.bottom / 100) * H + 24
    taken.push([x - w / 2, y - 19, x + w / 2, y + 19])
  }
  // Подпись салона тоже занимает место
  taken.push(variant === 'light' ? [cx + 24, cy - 110, cx + 342, cy - 20] : [cx + 21, cy - 80, cx + 300, cy])

  // На каждую улицу в JSON несколько мест для подписи — берём первое, что целиком в кадре и ничего не закрывает
  const clear = (x: number, y: number, text: string, angle: number) => {
    const half = (text.length * 11) / 2
    const hx = half * Math.abs(Math.cos((angle * Math.PI) / 180)) + 4
    const hy = half * Math.abs(Math.sin((angle * Math.PI) / 180)) + 10
    return taken.every(([x1, y1, x2, y2]) => x + hx < x1 || x - hx > x2 || y + hy < y1 || y - hy > y2)
  }
  const chosen = [...new Set(map.labels.map((l) => l.text))].flatMap((text) => {
    const spot = map.labels.find((l) => l.text === text && fits((l.x / 100) * W, (l.y / 100) * H, l.text, l.angle) && clear((l.x / 100) * W, (l.y / 100) * H, l.text, l.angle))
    return spot ? [spot] : []
  })

  const labels = chosen
    .map((l) => {
      const x = (l.x / 100) * W
      const y = (l.y / 100) * H
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${l.angle} ${x.toFixed(1)} ${y.toFixed(1)})">${esc(l.text)}</text>`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${bandTop} ${W} ${bandH}" width="${W}" height="${bandH}">
<rect y="${bandTop}" width="${W}" height="${bandH}" fill="${C.bg}"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="${L.green}" fill="${C.green}"/>
<path d="${L.water}" fill="${C.water}"/>
<path d="${L.river}" stroke="${C.water}" stroke-width="6"/>
<path d="${L.building}" fill="${C.building}"/>
<path d="${L.minor}" stroke="${C.roadCasing}" stroke-width="8"/>
<path d="${L.minor}" stroke="${C.road}" stroke-width="6"/>
<path d="${L.rail}" stroke="${C.rail}" stroke-width="2" stroke-dasharray="10 6"/>
<path d="${L.major}" stroke="${C.roadCasing}" stroke-width="16"/>
<path d="${L.major}" stroke="${C.road}" stroke-width="13"/>
<path d="${L.landmark}" fill="${C.landmark}"/>
<path d="${L.salon}" fill="${C.salon}" stroke="${C.salon}" stroke-width="4"/>
</g>
<g font-family="${FONT}" font-size="19" font-weight="600" fill="${C.label}" text-anchor="middle" dominant-baseline="middle" stroke="${C.halo}" stroke-width="4" paint-order="stroke">${labels}</g>
</svg>`
}
