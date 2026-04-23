import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'

export function useSimulation(planId) {
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [delayDays, setDelayDays] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  
  const runSimulation = useCallback(async (taskId, days) => {
    if (!taskId || days === 0) {
      setResult(null)
      return
    }
    
    setLoading(true)
    try {
      const response = await axios.post(`/simulate/delay`, null, {
        params: { plan_id: planId, task_id: taskId, delay_days: days }
      })
      setResult(response.data)
    } catch (err) {
      console.error('Simulation failed:', err)
    } finally {
      setLoading(false)
    }
  }, [planId])

  // Debounced execution when delay changes via slider
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTaskId) runSimulation(activeTaskId, delayDays)
    }, 150)
    return () => clearTimeout(timer)
  }, [delayDays, activeTaskId, runSimulation])

  const acceptSimulation = async () => {
    if (!activeTaskId || delayDays === 0) return
    try {
      await axios.post(`/simulate/accept`, null, {
        params: { plan_id: planId, task_id: activeTaskId, delay_days: delayDays }
      })
      return true
    } catch (err) {
      console.error('Acceptance failed:', err)
      return false
    }
  }

  return {
    activeTaskId, setActiveTaskId,
    delayDays, setDelayDays,
    loading, result,
    acceptSimulation
  }
}
