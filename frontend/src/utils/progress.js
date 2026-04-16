const STORAGE_KEY = 'week_progress'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {} }
  catch { return {} }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// --- Oslo timezone helpers ---

function osloDateStr(date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date) // 'YYYY-MM-DD'
}

function addCalendarDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return osloDateStr(new Date(Date.UTC(y, m - 1, d + n)))
}

function oslo10am(dateStr) {
  // Oslo is UTC+1 (winter) or UTC+2 (summer) — try both
  for (const utcHour of [9, 8]) {
    const candidate = new Date(`${dateStr}T${String(utcHour).padStart(2, '0')}:00:00.000Z`)
    const h = parseInt(new Intl.DateTimeFormat('en', {
      timeZone: 'Europe/Oslo', hour: 'numeric', hour12: false,
    }).format(candidate))
    if (h === 10) return candidate
  }
}

// --- Public API ---

export function getUnlockTime(startedAt, minDays = 5) {
  const startDate = osloDateStr(new Date(startedAt))
  const unlockDate = addCalendarDays(startDate, minDays)
  return oslo10am(unlockDate)
}

export function startWeek(weekId) {
  const p = load()
  if (!p[weekId]?.startedAt) {
    p[weekId] = { startedAt: new Date().toISOString(), completedItems: [] }
    save(p)
  }
}

export function completeItem(weekId, itemId, allItemIds) {
  const p = load()
  const w = p[weekId] ?? { startedAt: new Date().toISOString() }
  const completedItems = [...new Set([...(w.completedItems ?? []), itemId])]
  const allDone = allItemIds.length > 0 && allItemIds.every(id => completedItems.includes(id))
  p[weekId] = {
    ...w,
    completedItems,
    ...(allDone && !w.completedAt ? { completedAt: new Date().toISOString() } : {}),
  }
  save(p)
  return { allDone, weekProgress: p[weekId] }
}

export function getCompletedItems(weekId) {
  return load()[weekId]?.completedItems ?? []
}

// Sets startedAt to 6 days ago so the time gate is already satisfied
export function devUnlockNext(weekId) {
  const p = load()
  const sixDaysAgo = new Date(Date.now() - 6 * 86_400_000).toISOString()
  p[weekId] = {
    ...p[weekId],
    startedAt: sixDaysAgo,
    completedAt: p[weekId]?.completedAt ?? new Date().toISOString(),
  }
  save(p)
}

export function getWeekStatus(weekId) {
  const p = load()
  if (weekId === 1) {
    return p[1]?.completedAt ? 'done' : 'active'
  }
  const prev = p[weekId - 1]
  if (!prev?.completedAt || !prev?.startedAt) return 'locked'
  if (Date.now() < getUnlockTime(prev.startedAt).getTime()) return 'locked'
  return p[weekId]?.completedAt ? 'done' : 'active'
}

// How many days until week `weekId` unlocks (null = not yet completable)
export function daysUntilUnlock(weekId) {
  if (weekId <= 1) return null
  const prev = load()[weekId - 1]
  if (!prev?.startedAt || !prev?.completedAt) return null
  const ms = getUnlockTime(prev.startedAt).getTime() - Date.now()
  return ms <= 0 ? 0 : Math.ceil(ms / 86_400_000)
}
