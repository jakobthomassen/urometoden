import { WEEKS } from '../data/weeks'
import { getUnlockTime } from '../utils/progress'

export function useWeekProgress(weekDbData = {}) {
  const weeks = WEEKS.map(w => {
    const db   = weekDbData[w.id]   ?? {}
    const prev = weekDbData[w.id - 1] ?? {}

    let status
    if (w.id === 1) {
      status = db.completed_at ? 'done' : 'active'
    } else if (!prev.completed_at || !prev.started_at) {
      status = 'locked'
    } else if (Date.now() < getUnlockTime(prev.started_at).getTime()) {
      status = 'locked'
    } else {
      status = db.completed_at ? 'done' : 'active'
    }

    const unlockAt = w.id > 1 && prev.started_at && prev.completed_at
      ? getUnlockTime(prev.started_at)
      : null

    const daysUntilUnlock = unlockAt
      ? Math.max(0, Math.ceil((unlockAt.getTime() - Date.now()) / 86_400_000))
      : null

    return { ...w, status, daysUntilUnlock, unlockAt }
  })

  return { weeks }
}
