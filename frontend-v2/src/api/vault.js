import axios from 'axios'

const API_BASE = '/api/vault'

export const uploadToVault = async (file, userId = 1) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_id', userId)
  
  const response = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const getVaultDocs = async (userId = 1) => {
  const response = await axios.get(`${API_BASE}/`, { params: { user_id: userId } })
  return response.data
}

export const deleteVaultDoc = async (docId, userId = 1) => {
  const response = await axios.delete(`${API_BASE}/${docId}`, { params: { user_id: userId } })
  return response.data
}

export const matchVaultToPlan = async (planId, userId = 1) => {
  const response = await axios.get(`${API_BASE}/match`, { params: { plan_id: planId, user_id: userId } })
  return response.data
}

export const linkDocToTask = async (vaultDocId, taskId, requirementId) => {
  const response = await axios.post(`${API_BASE}/link`, {
    vault_doc_id: vaultDocId,
    task_id: taskId,
    requirement_id: requirementId
  })
  return response.data
}

export const renameVaultDoc = async (docId, newName, userId = 1) => {
  const formData = new FormData()
  formData.append('name', newName)
  formData.append('user_id', userId)
  const response = await axios.patch(`${API_BASE}/${docId}`, formData)
  return response.data
}
