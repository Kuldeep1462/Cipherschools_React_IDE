const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  const headers = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  // For project routes, also add user-id header for backward compatibility
  headers["user-id"] = localStorage.getItem("userId") || "user-123"
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
        body: JSON.stringify({ name, description }),
      })
      return response.json()
    },

    get: async (projectId) => {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: getAuthHeaders(),
      })
      return response.json()
    },

    update: async (projectId, data) => {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      return response.json()
    },

    delete: async (projectId) => {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      return response.json()
    },

    getUserProjects: async () => {
      const response = await fetch(`${API_BASE_URL}/projects/user/projects`, {
        headers: getAuthHeaders(),
      })
      return response.json()
    },
  },
}
