/**
 * src/lib/salon-hours.ts
 *
 * «Открыто до 20:00» / «Откроемся в 10:00» — статус салона по времени
 * ЧЕЛЯБИНСКА, а не браузера: гость из Москвы в 18:30 по своим часам видел
 * бы «открыто», когда в салоне уже 20:30. Расписание — schemaOrgHours из
 * contacts-data.ts (тот же источник, что у разметки LocalBusiness).
 *
 * Только для клиента: на сборке время неизвестно, статичный HTML показывает
 * нейтральный текст, а остров подставляет статус после загрузки.
 */
import { companyLegalInfo } from './contacts-data'

const TIME_ZONE = 'Asia/Yekaterinburg' // Челябинск, UTC+5

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
type Day = (typeof DAYS)[number]

const scheduleFor = (day: Day) =>
  companyLegalInfo.schemaOrgHours.find((h) => (h.dayOfWeek as readonly string[]).includes(day)) ?? null

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export interface SalonStatus {
  /** Крупно на плитке: «до 20:00» / «с 10:00» */
  time:  string
  /** Строкой под временем: «Открыто сейчас» / «Откроемся завтра» */
  label: string
}

export function salonStatus(now: Date = new Date()): SalonStatus {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE, weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = get('weekday') as Day
  const minutes = Number(get('hour')) * 60 + Number(get('minute'))

  const today = scheduleFor(day)
  if (today) {
    if (minutes >= toMinutes(today.opens) && minutes < toMinutes(today.closes)) return { time: `до ${today.closes}`, label: 'Открыто сейчас' }
    if (minutes < toMinutes(today.opens)) return { time: `с ${today.opens}`, label: 'Откроемся сегодня' }
  }
  const tomorrow = scheduleFor(DAYS[(DAYS.indexOf(day) + 1) % 7]!)
  return { time: `с ${tomorrow?.opens ?? '10:00'}`, label: 'Откроемся завтра' }
}
