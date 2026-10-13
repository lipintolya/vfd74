/**
 * /salon-map-light.svg — собственная карта окрестностей салона (см.
 * src/lib/salon-map.ts). Отдельный файл, чтобы браузер кешировал её один раз.
 */
import type { APIRoute } from 'astro'
import { salonMapSvg } from '../lib/salon-map'

export const GET: APIRoute = () =>
  new Response(salonMapSvg('light'), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } })
