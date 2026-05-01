import { useState, useEffect, useCallback } from 'react'

const EMPTY = { progress: {}, reflections: {}, weeks: {}, active_week: 1 }
const EMPTY_STATS = { streak: 0, total_listen_seconds: 0, weeks_completed: 0 }

export function useUserProgress() {
  const [data,   setData]   = useState(EMPTY)
  const [stats,  setStats]  = useState(EMPTY_STATS)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(() => {
    return Promise.all([
      fetch('/api/me/progress').then(r => r.ok ? r.json() : null),
      fetch('/api/me/stats').then(r => r.ok ? r.json() : null),
    ]).then(([pd, sd]) => {
      if (pd) setData(pd)
      if (sd) setStats(sd)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function startWeek(weekId) {
    await fetch(`/api/me/weeks/${weekId}/start`, { method: 'POST' })
    setData(d => ({
      ...d,
      active_week: weekId,
      weeks: {
        ...d.weeks,
        [weekId]: {
          started_at:   d.weeks[weekId]?.started_at   ?? Date.now(),
          completed_at: d.weeks[weekId]?.completed_at ?? null,
        },
      },
    }))
  }

  async function devUnlockWeek(weekId) {
    await fetch(`/api/me/weeks/${weekId}/start?unlock=dev`, { method: 'POST' })
    await refresh()
  }

  async function updateProgress(itemId, patch) {
    const res = await fetch(`/api/me/progress/${itemId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(patch),
    })
    if (!res.ok) return

    setData(d => {
      const cur = d.progress[itemId] ?? { position_seconds: 0, listen_seconds: 0, completed_at: null }
      return {
        ...d,
        progress: {
          ...d.progress,
          [itemId]: {
            position_seconds: patch.position_seconds ?? cur.position_seconds,
            listen_seconds:   patch.listen_seconds   ?? cur.listen_seconds,
            completed_at:     patch.completed ? (cur.completed_at ?? Date.now()) : cur.completed_at,
          },
        },
      }
    })

    // Refresh for server-computed week completion
    if (patch.completed) refresh()
  }

  async function updateReflection(itemId, text) {
    const res = await fetch(`/api/me/reflections/${itemId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ body: text }),
    })
    if (!res.ok) return

    setData(d => {
      const cur = d.progress[itemId] ?? { position_seconds: 0, listen_seconds: 0 }
      return {
        ...d,
        reflections: { ...d.reflections, [itemId]: text },
        progress: {
          ...d.progress,
          [itemId]: { ...cur, completed_at: cur.completed_at ?? Date.now() },
        },
      }
    })

    refresh()
  }

  return { data, stats, loaded, startWeek, devUnlockWeek, updateProgress, updateReflection, refresh }
}
