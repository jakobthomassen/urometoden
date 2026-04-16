import { useState, useCallback } from 'react'
import { WEEKS } from '../data/weeks'
import { getWeekStatus, daysUntilUnlock } from '../utils/progress'

function computeWeeks() {
  return WEEKS.map(w => ({
    ...w,
    status:          getWeekStatus(w.id),
    daysUntilUnlock: daysUntilUnlock(w.id),
  }))
}

export function useWeekProgress() {
  const [weeks, setWeeks] = useState(computeWeeks)
  const refresh = useCallback(() => setWeeks(computeWeeks()), [])
  return { weeks, refresh }
}
