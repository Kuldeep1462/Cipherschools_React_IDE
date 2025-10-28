// Normalize API base: accept values with or without trailing /api
const RAW_API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"
const __trimmed = RAW_API_BASE_URL.replace(/\/+$/, '')
const API_BASE_URL = __trimmed.endsWith('/api') ? __trimmed : `${__trimmed}/api`

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  // Ensure a stable guest id if not signed in
  if (!localStorage.getItem("userId") && !token) {
    const guestId = `guest-${Math.random().toString(36).slice(2)}-${Date.now()}`
    localStorage.setItem("userId", guestId)
  }
  const headers = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  // For project routes, also add user-id header for backward compatibility
  headers["user-id"] = localStorage.getItem("userId")
  return headers
}

export const api = {
  auth: {
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
      return response.json()
    },

    register: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
      return response.json()
    },
  },

  projects: {
    create: async (name, description) => {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ name, description }),
      })
      return response.json()
    },

    get: async (projectId) => {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      })
      return response.json()
    },

    update: async (projectId, data) => {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(data),
      })
      return response.json()
    },

    delete: async (projectId) => {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      })
      return response.json()
    },

    getUserProjects: async () => {
      const response = await fetch(`${API_BASE_URL}/projects/user/projects`, {
        headers: getAuthHeaders(),
        credentials: "include",
      })
      return response.json()
    },
  },
}
