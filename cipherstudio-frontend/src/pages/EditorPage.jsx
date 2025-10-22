"use client"

import { useEffect, useContext } from "react"
import { useParams } from "react-router-dom"
import { ProjectContext } from "../context/ProjectContext"
import Sidebar from "../components/Sidebar/Sidebar"
import Editor from "../components/Editor/Editor"
import Preview from "../components/Preview/Preview"
import "./EditorPage.css"

function EditorPage() {
  const { projectId } = useParams()
  const { currentProject, loadProject } = useContext(ProjectContext)

  useEffect(() => {
    if (projectId) {
      loadProject(projectId)
    }
  }, [projectId, loadProject])

  if (!currentProject) {
    return <div style={{ padding: "20px" }}>Loading project...</div>
  }

  return (
    <div className="editor-page">
      <div className="editor-layout">
        <div className="editor-sidebar">
          <Sidebar />
        </div>
        <div className="editor-main">
          <div className="editor-code">
            <Editor />
          </div>
          <div className="editor-preview">
            <Preview />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorPage
