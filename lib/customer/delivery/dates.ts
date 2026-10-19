export function parseIso(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00`)
}

export function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toMonthValue(iso: string): string {
  return iso.slice(0, 7)
}

export function monthValueToIso(monthValue: string, day = 1): string {
  const [y, m] = monthValue.split('-').map(Number)
  return toIso(new Date(y!, m! - 1, day, 12))
}

export function formatShortDate(iso: string): string {
  return parseIso(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCompactDate(iso: string): string {
  return parseIso(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}
