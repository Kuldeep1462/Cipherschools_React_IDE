"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ProjectContext } from "../context/ProjectContext"
import "./Home.css"

function Home() {
  const navigate = useNavigate()
  const { createProject } = useContext(ProjectContext)
  const [projectName, setProjectName] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [recentProjects, setRecentProjects] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem("recentProjects")
    if (stored) {
      setRecentProjects(JSON.parse(stored))
    }
  }, [])

  const handleCreateProject = async () => {
    if (projectName.trim()) {
      const project = await createProject(projectName, "New React project")
      if (project) {
        const recent = [project, ...recentProjects.slice(0, 4)]
        setRecentProjects(recent)
        localStorage.setItem("recentProjects", JSON.stringify(recent))
        navigate(`/editor/${project.projectId}`)
      }
      setProjectName("")
      setShowForm(false)
    }
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">CipherStudio</h1>
        <p className="home-subtitle">Write, run, and preview React code directly in your browser. No setup required.</p>
        <div className="home-buttons">
          <button className="home-button home-button-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create New Project"}
          </button>
          <button className="home-button home-button-secondary">View Examples</button>
        </div>

        {showForm && (
          <div style={{ marginTop: "32px" }}>
            <input
              type="text"
              placeholder="Project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "4px",
                border: `1px solid var(--color-border)`,
                backgroundColor: "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
                fontSize: "14px",
                marginRight: "8px",
                minWidth: "200px",
              }}
              onKeyPress={(e) => e.key === "Enter" && handleCreateProject()}
            />
            <button className="home-button home-button-primary" onClick={handleCreateProject}>
              Create
            </button>
          </div>
        )}

        {recentProjects.length > 0 && (
          <div className="home-projects">
            <h2 className="home-projects-title">Recent Projects</h2>
            <div className="home-projects-grid">
              {recentProjects.map((project) => (
                <div
                  key={project.projectId}
                  className="project-card"
                  onClick={() => navigate(`/editor/${project.projectId}`)}
                >
                  <div className="project-card-name">{project.name}</div>
                  <div className="project-card-description">{project.description || "No description"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
