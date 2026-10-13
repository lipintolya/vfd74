/**
 * Собственная векторная карта окрестностей салона (ул. Братьев Кашириных,
 * 131Б) — вместо скриншота Яндекс Карт и iframe. Геометрия — OpenStreetMap
 * (src/data/visit-map.json, scripts/gen-visit-map.mjs), цвета — палитра сайта.
 *
 * Отдаётся как отдельные SVG-файлы (src/pages/salon-map-*.svg.ts), а не
 * inline: футер есть на всех ~400 страницах, картинка кешируется браузером
 * один раз. В <img> не видны CSS-переменные и веб-шрифты, поэтому цвета
 * подставляются при сборке, шрифт — системный.
 *
 * Варианты: dark — футер (графит, метка бирюзовая), light — страница
 * контактов (светлая, здание салона выделено, карточка с адресом).
 */
import map from '../data/visit-map.json'
import { companyLegalInfo } from './contacts-data'

export type SalonMapVariant = 'light' | 'dark'

const PALETTES = {
  light: {
    bg: '#f8fafc', green: '#e6f2ec', water: '#d9e6f2', building: '#e2e8f0',
    roadCasing: '#cbd5e1', road: '#ffffff', rail: '#94a3b8', salon: '#0d9488',
    label: '#64748b', halo: '#f8fafc', signal: '#14b8a6', ink: '#0f172a',
    card: '#ffffff', cardStroke: '#e2e8f0',
  },
  dark: {
    bg: '#18181a', green: '#1e1e21', water: '#1f2937', building: '#232227',
    roadCasing: '#18181a', road: '#34343a', rail: '#52525b', salon: '#14b8a6',
    label: '#8b8b94', halo: '#18181a', signal: '#2dd4bf', ink: '#ffffff',
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
  const street = companyLegalInfo.address.legal.replace(/^г\.\s*[^,]+,\s*/, '')

  /* Тёмная карта — широкая полоса вокруг метки (футер ~3:1): подписи вне
     полосы или торчащие за её край не рисуем — иначе их обрезало бы. */
  const bandH = variant === 'dark' ? 336 : H
  const bandTop = (H - bandH) / 2
  const fits = (x: number, y: number, text: string, angle: number) => {
    const half = (text.length * 12) / 2
    const hx = half * Math.abs(Math.cos((angle * Math.PI) / 180))
    const hy = half * Math.abs(Math.sin((angle * Math.PI) / 180)) + 12
    return x - hx > 15 && x + hx < W - 15 && y - hy > bandTop + 10 && y + hy < bandTop + bandH - 10
  }

  const labels = map.labels
    .filter((l) => fits((l.x / 100) * W, (l.y / 100) * H, l.text, l.angle))
    .map((l) => {
      const x = (l.x / 100) * W
      const y = (l.y / 100) * H
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" transform="rotate(${l.angle} ${x.toFixed(1)} ${y.toFixed(1)})">${esc(l.text)}</text>`
    })
    .join('')

  // Подпись салона: в светлой версии — карточка с адресом, в тёмной — просто текст
  const pin = variant === 'light'
    ? `<g transform="translate(${cx + 24} ${cy - 104})">
<rect width="318" height="76" rx="14" fill="${C.card}" stroke="${C.cardStroke}" stroke-width="1.5"/>
<text x="18" y="32" font-family="${FONT}" font-size="25" font-weight="700" fill="${C.ink}">ВФД на Кашириных</text>
<text x="18" y="58" font-family="${FONT}" font-size="18" font-weight="500" fill="${C.label}">${esc(street)}</text>
</g>`
    : `<text x="${cx + 24}" y="${cy - 20}" font-family="${FONT}" font-size="27" font-weight="700" fill="${C.ink}" stroke="${C.halo}" stroke-width="6" paint-order="stroke">ВФД на Кашириных</text>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${bandTop} ${W} ${bandH}" width="${W}" height="${bandH}">
<style>
.pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.4s ease-out 3 both}
@keyframes pulse{0%{transform:scale(.4);opacity:.55}100%{transform:scale(1.6);opacity:0}}
@media (prefers-reduced-motion:reduce){.pulse{animation:none;opacity:0}}
</style>
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
<path d="${L.salon}" fill="${C.salon}" stroke="${C.salon}" stroke-width="4"/>
</g>
<g font-family="${FONT}" font-size="19" font-weight="600" fill="${C.label}" text-anchor="middle" dominant-baseline="middle" stroke="${C.halo}" stroke-width="4" paint-order="stroke">${labels}</g>
<circle class="pulse" cx="${cx}" cy="${cy}" r="26" fill="${C.signal}"/>
<circle cx="${cx}" cy="${cy}" r="10" fill="${C.signal}" stroke="${variant === 'light' ? '#ffffff' : C.bg}" stroke-width="4"/>
${pin}
</svg>`
}
