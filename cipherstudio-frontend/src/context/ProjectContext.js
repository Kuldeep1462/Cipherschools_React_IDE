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
      let cachedSelectedId = null
      const cached = localStorage.getItem(`project-${projectId}`)
      if (cached) {
        const data = JSON.parse(cached)
        console.log("Loaded from cache, files:", data.files?.map(f => ({ name: f.name, contentLength: f.content?.length })))
        // Normalize selectedFile from cache as well (it might be an id string)
        let normalizedCached = { ...data }
        if (data.selectedFile && typeof data.selectedFile === "string") {
          const fileObj = data.files?.find(f => f.id === data.selectedFile)
          normalizedCached.selectedFile = fileObj || null
        }
        cachedSelectedId = normalizedCached.selectedFile?.id || null
        setCurrentProject(normalizedCached)
      }

      // Then fetch from backend to sync
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`)
      const data = await response.json()
      console.log("Loaded from backend, files:", data.files?.map(f => ({ name: f.name, contentLength: f.content?.length })))
      // Normalize selectedFile: backend may return an id string
      let normalized = { ...data }
      if (data.selectedFile && typeof data.selectedFile === "string") {
        const fileObj = data.files?.find(f => f.id === data.selectedFile)
        normalized.selectedFile = fileObj || null
      }
      // If backend didn't return a selected file, carry over cached/current selection if still present
      if (!normalized.selectedFile && (cachedSelectedId || currentProject?.selectedFile?.id)) {
        const carryId = cachedSelectedId || currentProject?.selectedFile?.id
        const carryFile = normalized.files?.find(f => f.id === carryId)
        if (carryFile) {
          normalized.selectedFile = carryFile
        } else if (normalized.files && normalized.files.length > 0) {
          // fall back to first file to ensure non-null
          normalized.selectedFile = normalized.files[0]
        }
      }
      setCurrentProject(normalized)
      localStorage.setItem(`project-${projectId}`, JSON.stringify(normalized))
      // Update last saved files reference when loading
      lastSavedFilesRef.current = JSON.stringify(normalized.files.map(f => ({ id: f.id, content: f.content })))
      return normalized
    } catch (error) {
      console.error("Error loading project:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveProject = useCallback(async (projectId, projectData) => {
    try {
      console.log("🚀 Context: Starting project save", {
        projectId,
        fileCount: projectData.files?.length,
        selectedFile: projectData.selectedFile?.name
      });

      // Validate data before sending
      if (!projectData.files || !Array.isArray(projectData.files)) {
        throw new Error("Invalid files array in project data");
      }

      const fileDetails = projectData.files.map(f => ({
        name: f.name,
        id: f.id,
        contentLength: f.content?.length || 0,
        preview: f.content?.substring(0, 50) + "..."
      }));
      console.log("📦 Context: Files to save:", fileDetails);

      const payload = {
        files: projectData.files,
        dependencies: projectData.dependencies,
        name: projectData.name,
        description: projectData.description,
        selectedFile: projectData.selectedFile?.id || projectData.selectedFile,
      };
      
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Context: Save successful", {
        receivedFiles: data.files?.length,
        selectedFile: data.selectedFile
      });

      // Normalize selectedFile if backend returned an id
      let normalized = { ...data }
      if (data.selectedFile && typeof data.selectedFile === "string") {
        const fileObj = data.files?.find(f => f.id === data.selectedFile)
        normalized.selectedFile = fileObj || null
      }

      // Store in localStorage
      localStorage.setItem(`project-${projectId}`, JSON.stringify(normalized));
      
      // Update last saved reference first
      lastSavedFilesRef.current = JSON.stringify(normalized.files.map(f => ({
        id: f.id,
        content: f.content,
        name: f.name
      })));

      // Then update current project state
      setCurrentProject(normalized);
      
      return normalized;
    } catch (error) {
      console.error("❌ Context: Save failed", error);
      // Fallback to localStorage
      localStorage.setItem(`project-${projectId}`, JSON.stringify(projectData));
      setCurrentProject(projectData);
    }
  }, [])

  useEffect(() => {
    if (!autoSaveEnabled || !currentProject?.files) return

    // Check if files have actually changed since last save
    const currentFiles = currentProject.files.map(f => ({ 
      id: f.id, 
      content: f.content,
      name: f.name 
    }))
    const lastSavedFiles = lastSavedFilesRef.current ? 
      JSON.parse(lastSavedFilesRef.current) : []

    // Compare files content
    const hasChanges = currentFiles.some(currentFile => {
      const lastSavedFile = lastSavedFiles.find(f => f.id === currentFile.id)
      return !lastSavedFile || 
        lastSavedFile.content !== currentFile.content
    })

    if (!hasChanges) {
      return // No changes, don't save
    }

    console.log("Auto-save triggered for project:", currentProject.projectId)
    const timer = setTimeout(() => {
      console.log("Executing auto-save")
      lastSavedFilesRef.current = JSON.stringify(currentFiles) // Store the current state
      saveProject(currentProject.projectId, currentProject)
    }, 2000)

    return () => clearTimeout(timer)
  }, [currentProject?.files, autoSaveEnabled, saveProject])

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
      // Normalize selectedFile if needed
      let normalized = { ...data }
      if (data.selectedFile && typeof data.selectedFile === "string") {
        const fileObj = data.files?.find(f => f.id === data.selectedFile)
        normalized.selectedFile = fileObj || null
      }
      setCurrentProject(normalized)
      localStorage.setItem(`project-${projectId}`, JSON.stringify(normalized))
      return normalized
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
