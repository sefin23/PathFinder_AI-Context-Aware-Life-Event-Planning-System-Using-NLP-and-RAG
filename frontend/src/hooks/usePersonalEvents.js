import { useState, useEffect, useCallback } from 'react'
import { getPersonalEvents, createPersonalEvent, deletePersonalEvent } from '../api/backend'

/**
 * Fetches, creates, and deletes personal events for a given plan.
 * Conflict detection is a pure derived value — no extra API call needed.
 */
export function usePersonalEvents(planId) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchEvents = useCallback(async () => {
    if (!planId) return
    setLoading(true)
    try {
      const data = await getPersonalEvents(1, planId)
      setEvents(data)
    } catch (err) {
      console.error('Failed to fetch personal events:', err)
    } finally {
      setLoading(false)
    }
  }, [planId])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const addEvent = useCallback(async (eventData) => {
    const created = await createPersonalEvent({ ...eventData, life_event_id: planId })
    setEvents(prev => [...prev, created].sort((a, b) =>
      new Date(a.event_date) - new Date(b.event_date)
    ))
    return created
  }, [planId])

  const removeEvent = useCallback(async (eventId) => {
    await deletePersonalEvent(eventId)
    setEvents(prev => prev.filter(e => e.id !== eventId))
  }, [])

  /**
   * Returns a map of dateString → [personal events].
   * Used by the calendar and task cards for O(1) clash lookup.
   * dateString format: 'YYYY-MM-DD'
   */
  const eventsByDate = events.reduce((acc, e) => {
    const key = e.event_date // already 'YYYY-MM-DD' from backend
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  /**
   * For a given task, returns the clashing personal event (if any).
   * Tasks have a due_date (ISO datetime) or suggested_due_offset_days.
   */
  const getClashForTask = useCallback((task) => {
    if (!task.due_date) return null
    const taskDate = new Date(task.due_date).toISOString().split('T')[0]
    return eventsByDate[taskDate]?.[0] ?? null
  }, [eventsByDate])

  return {
    events,
    loading,
    addEvent,
    removeEvent,
    eventsByDate,
    getClashForTask,
    refetch: fetchEvents,
  }
}
