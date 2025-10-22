"use client"

import { useContext, useState } from "react"
import { ProjectContext } from "../../context/ProjectContext"
import "./FileExplorer.css"

function FileExplorer({ files, expandedFolders, onToggleFolder }) {
  const { currentProject, setCurrentProject, saveProject, updateProject } = useContext(ProjectContext)
  const [renamingFileId, setRenamingFileId] = useState(null)
  const [newFileName, setNewFileName] = useState("")

  const getFileIcon = (fileName) => {
    if (fileName.endsWith(".jsx") || fileName.endsWith(".js")) return "⚛️"
    if (fileName.endsWith(".css")) return "🎨"
    if (fileName.endsWith(".json")) return "📋"
    if (fileName.endsWith(".html")) return "🌐"
    return "📄"
  }

  const handleFileClick = (file) => {
    if (!currentProject) return
    setCurrentProject(prev => {
      const fileObj = prev.files.find(f => f.id === file.id) || file
      return { ...prev, selectedFile: fileObj }
    })
    if (currentProject.projectId) {
      updateProject(currentProject.projectId, { selectedFile: file.id })
    }
  }

  const handleRenameFile = (file) => {
    setRenamingFileId(file.id)
    setNewFileName(file.name)
  }

  const handleSaveRename = (file) => {
    if (newFileName.trim() && newFileName !== file.name) {
      const updatedFiles = currentProject.files.map((f) => (f.id === file.id ? { ...f, name: newFileName } : f))
      const updatedProject = { ...currentProject, files: updatedFiles }
      setCurrentProject(updatedProject)
      if (currentProject?.projectId) {
        saveProject(currentProject.projectId, updatedProject)
      }
    }
    setRenamingFileId(null)
    setNewFileName("")
  }

  const handleDeleteFile = (file) => {
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      const updatedFiles = currentProject.files.filter((f) => f.id !== file.id)
      const updatedProject = {
        ...currentProject,
        files: updatedFiles,
        selectedFile: updatedFiles.length > 0 ? updatedFiles[0] : null,
      }
      setCurrentProject(updatedProject)
      if (currentProject?.projectId) {
        saveProject(currentProject.projectId, updatedProject)
      }
    }
  }

  const renderFileTree = (fileList) => {
    if (!fileList || fileList.length === 0) {
      return <div className="file-explorer-empty">No files</div>
    }

    return (
      <ul className="file-explorer">
        {fileList.map((file) => (
          <li key={file.id} className="file-explorer-item">
            <div
              className={`file-explorer-item-header ${currentProject?.selectedFile?.id === file.id ? "active" : ""}`}
              onClick={() => handleFileClick(file)}
            >
              <span className="file-explorer-icon">{getFileIcon(file.name)}</span>
              {renamingFileId === file.id ? (
                <input
                  type="text"
                  className="file-explorer-rename-input"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={() => handleSaveRename(file)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveRename(file)
                    if (e.key === "Escape") setRenamingFileId(null)
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="file-explorer-name">{file.name}</span>
              )}
              {currentProject?.selectedFile?.id === file.id && renamingFileId !== file.id && (
                <div className="file-explorer-actions">
                  <button
                    className="file-explorer-action-btn"
                    title="Rename"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRenameFile(file)
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="file-explorer-action-btn"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFile(file)
                    }}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return <div className="file-explorer-container">{renderFileTree(files)}</div>
}

export default FileExplorer
