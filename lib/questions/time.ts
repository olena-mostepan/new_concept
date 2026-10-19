/** Parse relative labels like "3d ago" into milliseconds ago (for sorting). */
export function parseTimeAgoToMs(ago: string): number | null {
  const t = ago.trim().toLowerCase()
  if (t === 'just now') return 0
  const m = t.match(
    /^(\d+)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|week|weeks)\s*ago$/,
  )
  if (!m) return null
  const n = parseInt(m[1]!, 10)
  const u = m[2]!
  if (u.startsWith('m')) return n * 60_000
  if (u.startsWith('h')) return n * 3_600_000
  if (u.startsWith('d')) return n * 86_400_000
  if (u.startsWith('w')) return n * 604_800_000
  return null
}

export function agoToIso(ageLabel: string): string {
  const ms = parseTimeAgoToMs(ageLabel)
  if (ms === null) return new Date().toISOString()
  return new Date(Date.now() - ms).toISOString()
}
