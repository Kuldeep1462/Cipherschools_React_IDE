"use client"

import { useContext, useEffect, useRef, useCallback, useMemo } from "react"
import { ProjectContext } from "../../context/ProjectContext"
import "./Editor.css"

function Editor() {
  const { currentProject, setCurrentProject, saveProject, updateProject } = useContext(ProjectContext)
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const projectRef = useRef(null)
  const selectedIdRef = useRef(null)
  const contentListenerRef = useRef(null)
  const settingValueRef = useRef(false)

  const handleCodeChange = useCallback((newCode) => {
    const proj = projectRef.current
    const selectedId = selectedIdRef.current
    if (!proj || !selectedId) return

    const currentSelected = (typeof proj.selectedFile === 'object')
      ? proj.selectedFile
      : proj.files?.find(f => f.id === (proj.selectedFile || selectedId))
    const oldLength = currentSelected?.content?.length || 0
    if (currentSelected && currentSelected.content === newCode) {
      return // no-op if content unchanged (e.g., setValue echo)
    }

    console.log("🔄 Editor: Code change detected", {
      file: currentSelected?.name,
      newLength: newCode.length,
      oldLength,
      preview: (newCode || '').substring(0, 50) + "..."
    })

    const updatedFiles = (proj.files || []).map(f =>
      f.id === selectedId ? { ...f, content: newCode } : f
    )
    const updatedSelectedFile = updatedFiles.find(f => f.id === selectedId) || null
    const updatedProject = { ...proj, files: updatedFiles, selectedFile: updatedSelectedFile }
    setCurrentProject(updatedProject)
    console.log("✅ Editor: State update completed")
  }, [setCurrentProject])

  const initializeEditor = useCallback(() => {
    if (editorRef.current && window.monaco && !monacoRef.current) {
      try {
        monacoRef.current = window.monaco.editor.create(editorRef.current, {
          value: (currentProject?.selectedFile && typeof currentProject.selectedFile === 'object')
            ? (currentProject.selectedFile.content || "")
            : (currentProject?.files?.find(f => f.id === currentProject?.selectedFile)?.content || ""),
          language: getLanguage(
            (currentProject?.selectedFile && typeof currentProject.selectedFile === 'object')
              ? (currentProject.selectedFile.name || "")
              : (currentProject?.files?.find(f => f.id === currentProject?.selectedFile)?.name || "")
          ),
          theme: "vs-dark",
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: '"Fira Code", monospace',
          lineHeight: 1.6,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        })

        // Attach a single content listener that uses refs for up-to-date state
        contentListenerRef.current = monacoRef.current.onDidChangeModelContent(() => {
          try {
            // Ignore programmatic updates caused by selection changes
            if (settingValueRef.current) {
              settingValueRef.current = false
              return
            }
            const newCode = monacoRef.current.getValue()
            handleCodeChange(newCode)
          } catch (error) {
            console.error("Error handling code change:", error)
          }
        })
      } catch (error) {
        console.error("Error creating Monaco editor:", error)
      }
    }
  }, [currentProject?.selectedFile, currentProject?.files, handleCodeChange])

  useEffect(() => {
    const LOADER_SRC = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js"
    const VS_PATH = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs"

    // If Monaco already available, just init the editor
    if (window.monaco) {
      try { initializeEditor() } catch (e) { console.error("Error initializing Monaco editor:", e) }
      return
    }

    // If AMD loader is present, configure and load monaco
    if (window.require && typeof window.require.config === "function") {
      try {
        window.require.config({ paths: { vs: VS_PATH } })
        window.require(["vs/editor/editor.main"], () => {
          try { initializeEditor() } catch (e) { console.error("Error initializing Monaco editor:", e) }
        })
      } catch (e) {
        console.error("Error configuring Monaco require:", e)
      }
      return
    }

    // Avoid injecting the loader multiple times
    if (window.__monacoLoaderInjected) {
      // Loader is being fetched; wait for it to load
      const existing = document.querySelector('script[data-monaco-loader="true"]')
      if (existing) {
        existing.addEventListener("load", () => {
          try {
            window.require?.config?.({ paths: { vs: VS_PATH } })
            window.require?.(["vs/editor/editor.main"], () => initializeEditor())
          } catch (e) {
            console.error("Error after Monaco loader load:", e)
          }
        }, { once: true })
      }
      return
    }

    const existingScript = Array.from(document.getElementsByTagName("script")).find(
      (s) => s.src === LOADER_SRC
    )
    if (existingScript) {
      window.__monacoLoaderInjected = true
      existingScript.setAttribute("data-monaco-loader", "true")
      existingScript.addEventListener("load", () => {
        try {
          window.require?.config?.({ paths: { vs: VS_PATH } })
          window.require?.(["vs/editor/editor.main"], () => initializeEditor())
        } catch (e) {
          console.error("Error after Monaco loader load (existing):", e)
        }
      }, { once: true })
      return
    }

    // Inject loader once
    const script = document.createElement("script")
    script.src = LOADER_SRC
    script.async = true
    script.defer = true
    script.setAttribute("data-monaco-loader", "true")
    script.onload = () => {
      try {
        window.require.config({ paths: { vs: VS_PATH } })
        window.require(["vs/editor/editor.main"], () => {
          try { initializeEditor() } catch (e) { console.error("Error initializing Monaco editor:", e) }
        })
      } catch (e) {
        console.error("Error configuring Monaco require:", e)
      }
    }
    script.onerror = (error) => {
      console.error("Failed to load Monaco editor loader script:", error)
    }
    window.__monacoLoaderInjected = true
    document.head.appendChild(script)
  }, [initializeEditor])

  const getLanguage = (fileName) => {
    if (!fileName || typeof fileName !== "string") return "plaintext"
    if (fileName.endsWith(".jsx")) return "javascript"
    if (fileName.endsWith(".js")) return "javascript"
    if (fileName.endsWith(".css")) return "css"
    if (fileName.endsWith(".json")) return "json"
    if (fileName.endsWith(".html")) return "html"
    return "plaintext"
  }

  const getModelUri = (file) => {
    const proj = projectRef.current || currentProject
    const pid = proj?.projectId || 'proj'
    const fid = file?.id || 'file'
    const name = file?.name || 'untitled'
    return window.monaco.Uri.parse(`inmemory:///${pid}/${fid}/${name}`)
  }

  const handleSave = () => {
    console.log("Save button clicked")
    if (currentProject) {
      console.log("Calling saveProject with:", currentProject.projectId, currentProject)
      saveProject(currentProject.projectId, currentProject)
    } else {
      console.log("No current project to save")
    }
  }

  const handleFileSelect = useCallback((file) => {
    console.log("File selected:", file.name)
    setCurrentProject(prev => {
      if (!prev) return prev
      const fileObj = prev.files?.find(f => f.id === file.id) || file
      const updated = { ...prev, selectedFile: fileObj }
      // Update refs immediately to avoid race with onChange
      projectRef.current = updated
      selectedIdRef.current = fileObj.id
      return updated
    })
    // Persist selection id only to avoid rewriting whole project
    if (currentProject?.projectId) {
      updateProject(currentProject.projectId, { selectedFile: file.id })
    }
  }, [currentProject?.projectId, setCurrentProject, updateProject])

  // Resolve selected file to a concrete object regardless of id/object shape
  const resolvedSelectedFile = useMemo(() => {
    if (!currentProject) return null
    const sf = currentProject.selectedFile
    if (!sf) return currentProject.files?.[0] || null
    if (typeof sf === 'string') {
      return currentProject.files?.find(f => f.id === sf) || currentProject.files?.[0] || null
    }
    return sf
  }, [currentProject])

  useEffect(() => {
    projectRef.current = currentProject
  }, [currentProject])

  useEffect(() => {
    selectedIdRef.current = resolvedSelectedFile?.id || null
  }, [resolvedSelectedFile?.id])

  useEffect(() => {
    if (monacoRef.current && resolvedSelectedFile) {
      try {
        const selected = resolvedSelectedFile
        if (!selected || !selected.name) return

        const currentLanguage = getLanguage(selected.name)
        const content = selected.content || ""

        // Desired URI unique per project+file id
        const desiredUri = getModelUri(selected)

        // Current model on editor and any existing model by URI
        const currentModel = monacoRef.current.getModel()
        let targetModel = window.monaco.editor.getModel(desiredUri)
        if (!targetModel) {
          targetModel = window.monaco.editor.createModel(content, currentLanguage, desiredUri)
        }

        // Swap to target model if different
        if (!currentModel || currentModel.uri.toString() !== desiredUri.toString()) {
          settingValueRef.current = true
          monacoRef.current.setModel(targetModel)
          if (currentModel && currentModel.uri.toString() !== desiredUri.toString()) {
            try { currentModel.dispose() } catch {}
          }
        }

        // Ensure correct language
        if (targetModel.getLanguageId() !== currentLanguage) {
          try { window.monaco.editor.setModelLanguage(targetModel, currentLanguage) } catch {}
        }

        // Ensure correct content
        if (targetModel.getValue() !== content) {
          settingValueRef.current = true
          targetModel.setValue(content)
        }

        console.log("Editor updated with file:", selected.name, "content length:", content.length)
        console.log("Content preview:", content.substring(0, 100) + (content.length > 100 ? "..." : ""))
      } catch (error) {
        console.error("Error updating Monaco editor:", error)
      }
    }
  }, [resolvedSelectedFile])

  const selectedFile = resolvedSelectedFile

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="editor-tabs">
          {currentProject?.files?.map((file) => (
            <button
              key={file.id}
              className={`editor-tab ${selectedFile?.id === file.id ? "active" : ""}`}
              onClick={() => handleFileSelect(file)}
            >
              {file.name}
            </button>
          ))}
        </div>
        <div className="editor-actions">
          <button className="editor-action-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
      <div className="editor-content">
        {selectedFile ? (
          <div ref={editorRef} className="editor-wrapper" />
        ) : (
          <div className="editor-placeholder">No file selected</div>
        )}
      </div>
    </div>
  )
}

export default Editor
