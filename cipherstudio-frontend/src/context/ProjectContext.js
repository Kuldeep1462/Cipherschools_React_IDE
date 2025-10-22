"use client"

import { createContext, useState, useCallback, useEffect, useRef } from "react"

export const ProjectContext = createContext()

export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const lastSavedFilesRef = useRef(null)

  const createProject = useCallback(async (name, description) => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": "user-123",
        },
        body: JSON.stringify({ name, description }),
      })
      const data = await response.json()
      setCurrentProject(data)
      localStorage.setItem(`project-${data.projectId}`, JSON.stringify(data))
      return data
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadProject = useCallback(async (projectId) => {
    setLoading(true)
    try {
      console.log("Loading project:", projectId)
      const cached = localStorage.getItem(`project-${projectId}`)
      if (cached) {
        const data = JSON.parse(cached)
        console.log("Loaded from cache, files:", data.files?.map(f => ({ name: f.name, contentLength: f.content?.length })))
        setCurrentProject(data)
      }

      // Then fetch from backend to sync
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`)
      const data = await response.json()
      console.log("Loaded from backend, files:", data.files?.map(f => ({ name: f.name, contentLength: f.content?.length })))
      setCurrentProject(data)
      localStorage.setItem(`project-${projectId}`, JSON.stringify(data))
      // Update last saved files reference when loading
      lastSavedFilesRef.current = JSON.stringify(data.files.map(f => ({ id: f.id, content: f.content })))
      return data
    } catch (error) {
      console.error("Error loading project:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveProject = useCallback(async (projectId, projectData) => {
    try {
      console.log("Saving project:", projectId)
      console.log("Files to save:", projectData.files?.map(f => ({ name: f.name, contentLength: f.content?.length })))
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: projectData.files,
          dependencies: projectData.dependencies,
          name: projectData.name,
          description: projectData.description,
          selectedFile: projectData.selectedFile?.id || projectData.selectedFile,
        }),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      const data = await response.json()
      console.log("Project saved successfully, received back:", data.files?.map(f => ({ name: f.name, contentLength: f.content?.length })))
      localStorage.setItem(`project-${projectId}`, JSON.stringify(data))
      // Update current project state with saved data
      setCurrentProject(data)
      // Update last saved files reference
      lastSavedFilesRef.current = JSON.stringify(data.files.map(f => ({ id: f.id, content: f.content })))
      return data
    } catch (error) {
      console.error("Error saving project:", error)
      // Still save to localStorage even if backend fails
      localStorage.setItem(`project-${projectId}`, JSON.stringify(projectData))
      // Update current project state even on error to keep local changes
      setCurrentProject(projectData)
    }
  }, [])

  useEffect(() => {
    if (!autoSaveEnabled || !currentProject?.files) return

    // Check if files have actually changed since last save
    const currentFilesString = JSON.stringify(currentProject.files.map(f => ({ id: f.id, content: f.content })))
    const lastSavedFilesString = lastSavedFilesRef.current

    if (currentFilesString === lastSavedFilesString) {
      return // No changes, don't save
    }

    console.log("Auto-save triggered for project:", currentProject.projectId)
    const timer = setTimeout(() => {
      console.log("Executing auto-save")
      lastSavedFilesRef.current = currentFilesString // Update last saved state
      saveProject(currentProject.projectId, currentProject)
    }, 2000)

    return () => clearTimeout(timer)
  }, [currentProject?.files, currentProject?.selectedFile, autoSaveEnabled, saveProject])

  const updateProject = useCallback(async (projectId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })
      const data = await response.json()
      setCurrentProject(data)
      localStorage.setItem(`project-${projectId}`, JSON.stringify(data))
      return data
    } catch (error) {
      console.error("Error updating project:", error)
    }
  }, [])

  const deleteProject = useCallback(async (projectId) => {
    try {
      await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: "DELETE",
      })
      localStorage.removeItem(`project-${projectId}`)
      setCurrentProject(null)
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }, [])

  const value = {
    currentProject,
    loading,
    autoSaveEnabled,
    createProject,
    loadProject,
    updateProject,
    deleteProject,
    saveProject,
    setCurrentProject,
    setAutoSaveEnabled,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}
