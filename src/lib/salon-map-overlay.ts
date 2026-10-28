/**
 * Что лежит поверх SVG-карты салона (src/lib/salon-map.ts) живым HTML:
 * кадр карты и плашки ориентиров в процентах кадра. Метка салона всегда в
 * центре кадра — карта строится вокруг координат салона.
 *
 * Отдельный модуль: берёт из visit-map.json только размеры и ориентиры
 * (именованные импорты JSON), поэтому в клиентский код попадает пара
 * десятков байт, а не геометрия улиц.
 */
import { width, height, landmarks } from '../data/visit-map.json'

export type SalonMapVariant = 'light' | 'dark'

/** Тёмная карта — широкая полоса вокруг метки (футер ~3:1), светлая — кадр целиком */
export const DARK_BAND_HEIGHT = 360

export function mapFrame(variant: SalonMapVariant) {
  const h = variant === 'dark' ? DARK_BAND_HEIGHT : height
  return { width, height: h, top: (height - h) / 2 }
}

/** Плашка ориентира — под зданием, чтобы не закрывать улицу рядом; те, что
    не попали в кадр (полосу футера), отбрасываются */
export function landmarkPins(variant: SalonMapVariant) {
  const f = mapFrame(variant)
  return landmarks
    .map((m) => {
      const y = (m.bottom / 100) * height + 24
      return { text: m.text, x: m.x, y, pct: ((y - f.top) / f.height) * 100 }
    })
    .filter((m) => m.y > f.top + 20 && m.y < f.top + f.height - 20)
    .map((m) => ({ text: m.text, x: m.x, y: m.pct }))
}
