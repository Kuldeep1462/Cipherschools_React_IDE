"use client"

import { useContext, useEffect, useRef, useCallback } from "react"
import { ProjectContext } from "../../context/ProjectContext"
import "./Editor.css"

function Editor() {
  const { currentProject, setCurrentProject, saveProject } = useContext(ProjectContext)
  const editorRef = useRef(null)
  const monacoRef = useRef(null)

  const handleCodeChange = useCallback((newCode) => {
    if (currentProject?.selectedFile) {
      console.log("Code change detected for file:", currentProject.selectedFile.name, "new content length:", newCode.length)
      const updatedFiles = currentProject.files.map((file) =>
        file.id === currentProject.selectedFile.id ? { ...file, content: newCode } : file,
      )
      const updatedSelectedFile = updatedFiles.find(f => f.id === currentProject.selectedFile.id)
      console.log("Updated selectedFile content length:", updatedSelectedFile?.content?.length)
      const updatedProject = {
        ...currentProject,
        files: updatedFiles,
        selectedFile: updatedSelectedFile,
      }
      setCurrentProject(updatedProject)
      console.log("Project state updated with new file content")
    }
  }, [currentProject, setCurrentProject])

  const initializeEditor = useCallback(() => {
    if (editorRef.current && window.monaco && !monacoRef.current) {
      try {
        monacoRef.current = window.monaco.editor.create(editorRef.current, {
          value: currentProject?.selectedFile?.content || "",
          language: getLanguage(currentProject?.selectedFile?.name || ""),
          theme: "vs-dark",
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: '"Fira Code", monospace',
          lineHeight: 1.6,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        })

        monacoRef.current.onDidChangeModelContent(() => {
          try {
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
  }, [currentProject?.selectedFile, handleCodeChange])

  useEffect(() => {
    if (!window.monaco) {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.min.js"
      script.onload = () => {
        try {
          window.require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs" } })
          window.require(["vs/editor/editor.main"], () => {
            try {
              initializeEditor()
            } catch (error) {
              console.error("Error initializing Monaco editor:", error)
            }
          })
        } catch (error) {
          console.error("Error configuring Monaco require:", error)
        }
      }
      script.onerror = (error) => {
        console.error("Failed to load Monaco editor loader script:", error)
      }
      document.head.appendChild(script)
    } else {
      try {
        initializeEditor()
      } catch (error) {
        console.error("Error initializing Monaco editor:", error)
      }
    }
  }, [initializeEditor])

  const getLanguage = (fileName) => {
    if (fileName.endsWith(".jsx")) return "javascript"
    if (fileName.endsWith(".js")) return "javascript"
    if (fileName.endsWith(".css")) return "css"
    if (fileName.endsWith(".json")) return "json"
    if (fileName.endsWith(".html")) return "html"
    return "plaintext"
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
    setCurrentProject({ ...currentProject, selectedFile: file })
  }, [currentProject, setCurrentProject])

  useEffect(() => {
    if (monacoRef.current && currentProject?.selectedFile) {
      try {
        const currentLanguage = getLanguage(currentProject.selectedFile.name)
        window.monaco.editor.setTheme("vs-dark")
        const model = monacoRef.current.getModel()
        window.monaco.editor.setModelLanguage(model, currentLanguage)
        const content = currentProject.selectedFile.content || ""
        monacoRef.current.setValue(content)
        console.log("Editor updated with file:", currentProject.selectedFile.name, "content length:", content.length)
        console.log("Content preview:", content.substring(0, 100) + (content.length > 100 ? "..." : ""))
      } catch (error) {
        console.error("Error updating Monaco editor:", error)
      }
    }
  }, [currentProject?.selectedFile])

  const selectedFile = currentProject?.selectedFile || currentProject?.files?.[0] || null

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
