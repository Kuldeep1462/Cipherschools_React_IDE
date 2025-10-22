"use client"

import { useContext, useState } from "react"
import { ProjectContext } from "../../context/ProjectContext"
import FileExplorer from "../FileExplorer/FileExplorer"
import "./Sidebar.css"

function Sidebar() {
  const { currentProject, setCurrentProject } = useContext(ProjectContext)
  const [expandedFolders, setExpandedFolders] = useState({})
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [fileType, setFileType] = useState("jsx")

  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      alert("Please enter a file name")
      return
    }

    const fullFileName = newFileName.includes(".") ? newFileName : `${newFileName}.${fileType}`

    const newFile = {
      id: Date.now().toString(),
      name: fullFileName,
      content: getDefaultContent(fullFileName),
      type: fileType,
    }

    setCurrentProject({
      ...currentProject,
      files: [...(currentProject.files || []), newFile],
      selectedFile: newFile,
    })

    setShowNewFileModal(false)
    setNewFileName("")
    setFileType("jsx")
  }

  const getDefaultContent = (fileName) => {
    if (fileName.endsWith(".jsx")) {
      return `export default function Component() {
  return (
    <div>
      <h1>Hello from ${fileName}</h1>
    </div>
  )
}`
    } else if (fileName.endsWith(".css")) {
      return `/* Styles for your component */
.container {
  padding: 20px;
  background-color: #f5f5f5;
}`
    } else if (fileName.endsWith(".json")) {
      return `{
  "name": "config",
  "version": "1.0.0"
}`
    } else if (fileName.endsWith(".html")) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${fileName}</title>
</head>
<body>
  <h1>Welcome</h1>
</body>
</html>`
    }
    return ""
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Files</span>
        <div className="sidebar-actions">
          <button className="sidebar-button" title="New File" onClick={() => setShowNewFileModal(true)}>
            +
          </button>
          <button className="sidebar-button" title="New Folder">
            📁
          </button>
        </div>
      </div>
      <div className="sidebar-content">
        {currentProject && (
          <FileExplorer files={currentProject.files} expandedFolders={expandedFolders} onToggleFolder={toggleFolder} />
        )}
      </div>
      <div className="sidebar-footer">
        <div>Project: {currentProject?.name}</div>
      </div>

      {showNewFileModal && (
        <div className="modal-overlay" onClick={() => setShowNewFileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New File</h2>
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="fileName">File Name:</label>
                <input
                  id="fileName"
                  type="text"
                  className="form-input"
                  placeholder="e.g., MyComponent"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFile()
                    if (e.key === "Escape") setShowNewFileModal(false)
                  }}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="fileType">File Type:</label>
                <select
                  id="fileType"
                  className="form-select"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                >
                  <option value="jsx">JSX Component</option>
                  <option value="js">JavaScript</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="html">HTML</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="modal-button modal-button-cancel" onClick={() => setShowNewFileModal(false)}>
                  Cancel
                </button>
                <button className="modal-button modal-button-create" onClick={handleCreateFile}>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
