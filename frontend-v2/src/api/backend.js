/**
 * Pathfinder AI — Axios API client
 *
 * All requests go through the Vite dev proxy → FastAPI on :8000.
 * Each function returns the full Axios response data.
 * Errors bubble up to the caller — handle at the component level.
 *
 * TODO (L4): add analyzeWithClarification(text, answers)
 * TODO (L5): add getProgress(lifeEventId) and getTimeline(lifeEventId)
 */

import axios from 'axios'

/**
 * GET /users/{id}
 * @param {number} userId
 * @returns {Promise<object>}
 */
export async function getUser(userId = 1) {
  const res = await client.get(`/users/${userId}`)
  return res.data
}

/**
 * PATCH /users/{id}
 * @param {number} userId
 * @param {object} updates - { job_city, state_code, extracted_profile }
 * @returns {Promise<object>}
 */
export async function updateUser(userId = 1, updates) {
  const res = await client.patch(`/users/${userId}`, updates)
  return res.data
}

/**
 * GET /life-events/{id}
 * @param {number} lifeEventId
 * @returns {Promise<object>}
 */
export async function getLifeEvent(lifeEventId) {
  const res = await client.get(`/life-events/${lifeEventId}`)
  return res.data
}

/**
 * GET /life-events/
 * @param {number|null} userId
 * @returns {Promise<object[]>}
 */
export async function getLifeEvents(userId = 1) {
  const res = await client.get('/life-events/', { params: { user_id: userId } })
  return res.data
}

/**
 * PATCH /life-events/{id}
 * @param {number} lifeEventId
 * @param {object} updates - {title, description, status}
 * @returns {Promise<object>}
 */
export async function updateLifeEvent(lifeEventId, updates) {
  const res = await client.patch(`/life-events/${lifeEventId}`, updates)
  return res.data
}

/**
 * DELETE /life-events/{id}
 * @param {number} lifeEventId
 */
export async function deleteLifeEvent(lifeEventId) {
  await client.delete(`/life-events/${lifeEventId}`)
}

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 240000,
})

/**
 * POST /life-events/analyze
 * @param {string} text - Free-form user description of their life situation
 * @returns {Promise<{success: boolean, message: string, data: object}>}
 */
export async function analyzeLifeEvent(text, skipClarification = false) {
  const res = await client.post('/life-events/analyze', { 
    text, 
    skip_clarification: skipClarification 
  })
  return res.data
}

/**
 * POST /rag/retrieve
 * Uses the original user text as the semantic query and the first
 * detected life_event_type from the NLP step as the filter.
 *
 * @param {string} query - Original user text
 * @param {string} lifeEventType - First type from analyzeLifeEvent result
 * @param {number} topK - Number of results (default 5)
 * @returns {Promise<object>}
 */
export async function retrieveRequirements(query, lifeEventType, topK = 5) {
  const res = await client.post('/rag/retrieve', {
    query,
    life_event_type: lifeEventType,
    top_k: topK,
  })
  return res.data
}

/**
 * POST /life-events/propose-workflow
 * @param {string[]} lifeEventTypes - Array of detected event types
 * @param {string|null} location - Extracted location or null
 * @param {string|null} timeline - Extracted timeline or null
 * @returns {Promise<object>}
 */
export async function proposeWorkflow(lifeEventTypes, location = null, timeline = null, startDate = null) {
  const res = await client.post('/life-events/propose-workflow', {
    life_event_types: lifeEventTypes,
    location,
    timeline,
    top_k: 5,
    start_date: startDate
  })
  return res.data
}

/**
 * GET /life-events/{id}/recommendations
 * @param {number} lifeEventId
 * @returns {Promise<{recommendations: Array<{message: string, reason: string}>}>}
 */
export async function getRecommendations(lifeEventId) {
  const res = await client.get(`/life-events/${lifeEventId}/recommendations`)
  return res.data
}

export async function createLifeEvent(title, description, userId = 1, displayTitle = null, location = null, timeline = null, metadataJson = null) {
  const res = await client.post('/life-events/', { 
    title, 
    description, 
    user_id: userId,
    display_title: displayTitle,
    location,
    timeline,
    metadata_json: metadataJson
  })
  return res.data
}

/**
 * PATCH /life-events/{id} — persist AI requirements so the model is never re-called for saved events.
 * @param {number} lifeEventId 
 * @param {object} requirementsData - The full RAG response object from /rag/retrieve
 */
export async function saveRequirements(lifeEventId, requirementsData) {
  const res = await client.patch(`/life-events/${lifeEventId}`, {
    requirements_json: JSON.stringify(requirementsData)
  })
  return res.data
}

/**
 * POST /life-events/approve-workflow
 * @param {number} lifeEventId
 * @param {object[]} tasks
 * @returns {Promise<object>}
 */
export async function approveWorkflow(lifeEventId, tasks, startDate = null) {
  console.log("APPROVE_WORKFLOW called with tasks:", tasks)
  const payload = {
    life_event_id: lifeEventId,
    start_date: startDate,
    approved_tasks: tasks.map(t => ({
      title: t.title,
      description: t.description,
      phase_title: t.phase_title,
      priority: t.priority,
      due_offset_days: t.suggested_due_offset_days || 0,
      scheduled_date: t.scheduled_date,
      task_type: t.task_type,
      status: t.done ? 'completed' : 'pending',
      subtasks: t.subtasks.map(s => ({
        title: s.title,
        priority: s.priority,
        suggested_due_offset_days: s.suggested_due_offset_days || 0,
        scheduled_date: s.scheduled_date,
        task_type: s.task_type,
        status: s.done ? 'completed' : 'pending'
      }))
    }))
  }
  const res = await client.post('/life-events/approve-workflow', payload)
  return res.data
}

/**
 * PATCH /tasks/{id}/status
 * @param {number} taskId
 * @param {string} status - 'pending' or 'completed'
 * @returns {Promise<object>}
 */
export async function updateTaskStatus(taskId, status) {
  const res = await client.patch(`/tasks/${taskId}/status`, { status })
  return res.data
}

/**
 * PATCH /tasks/{id}
 * @param {number} taskId
 * @param {object} updates - {priority, due_date, reminder_opt_out}
 * @returns {Promise<object>}
 */
export async function updateTask(taskId, updates) {
  const res = await client.patch(`/tasks/${taskId}`, updates)
  return res.data
}

/**
 * PATCH /tasks/{id} - specific for scheduling with conflict detection
 * @param {number} taskId
 * @param {string} date - ISO Date
 */
export async function updateTaskScheduledDate(taskId, date) {
  const res = await client.patch(`/tasks/${taskId}`, { scheduled_date: date })
  return res.data
}

/**
 * POST /tasks/{id}/resolve-conflict
 * @param {number} taskId
 * @param {string} resolution - 'reschedule_others' | 'reschedule_current' | 'accept_conflict'
 * @param {string} date - The original proposed date
 */
export async function resolveTaskConflict(taskId, resolution, date) {
  const res = await client.post(`/tasks/${taskId}/resolve-conflict`, {
    resolution,
    scheduled_date: date
  })
  return res.data
}

// ── Personal Events ──────────────────────────────────────────────────────────

/**
 * GET /personal-events/?user_id=1&life_event_id=X
 * Returns personal events for a user, scoped to a plan + global ones.
 */
export async function getPersonalEvents(userId = 1, lifeEventId = null) {
  const params = { user_id: userId }
  if (lifeEventId) params.life_event_id = lifeEventId
  const res = await client.get('/personal-events/', { params })
  return res.data
}

/**
 * POST /personal-events/
 * @param {object} event - { title, event_type, event_date (ISO), notes, life_event_id }
 */
export async function createPersonalEvent(event, userId = 1) {
  const res = await client.post('/personal-events/', { ...event, user_id: userId })
  return res.data
}

/**
 * DELETE /personal-events/{id}
 */
export async function deletePersonalEvent(eventId) {
  await client.delete(`/personal-events/${eventId}`)
}
