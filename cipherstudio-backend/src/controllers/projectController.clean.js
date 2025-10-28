const Project = require("../models/Project")
const { v4: uuidv4 } = require("uuid")
const jwt = require("jsonwebtoken")

// Extract user id from JWT token only
const getTokenUserId = (req) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"]
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "")
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
      return decoded?.userId || null
    }
  } catch (e) {
    // invalid token
  }
  return null
}

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body
    const tokenUserId = getTokenUserId(req)
    const headerUserId = req.headers["user-id"]
    const userId = tokenUserId || headerUserId
    const isGuest = !tokenUserId
    if (!userId) {
      return res.status(400).json({ error: "User id missing" })
    }

    const projectId = uuidv4()

    const defaultFiles = [
      {
        id: uuidv4(),
        name: "App.jsx",
        type: "file",
        language: "jsx",
        content: `export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Welcome to CipherStudio</h1>
      <p>Start editing to see changes!</p>
    </div>
  );
}`,
      },
      {
        id: uuidv4(),
        name: "index.js",
        type: "file",
        language: "javascript",
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
      },
    ]

    const project = new Project({
      projectId,
      userId,
      name,
      description,
      files: defaultFiles,
      dependencies: new Map([
        ["react", "^18.0.0"],
        ["react-dom", "^18.0.0"],
      ]),
      isPublic: isGuest,
    })

    await project.save()
    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getProject = async (req, res) => {
  try {
    const { projectId } = req.params
    const project = await Project.findOne({ projectId })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    if (!project.isPublic) {
      const tokenUserId = getTokenUserId(req)
      if (!tokenUserId || String(tokenUserId) !== String(project.userId)) {
        return res.status(403).json({ error: "Forbidden" })
      }
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params
    const { files, dependencies, name, description, selectedFile } = req.body

    console.log("Backend updateProject called for:", projectId)
    console.log("Received data:", { filesCount: files?.length, dependencies, name, description, selectedFile })

    let project = await Project.findOne({ projectId })
    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    if (Array.isArray(files)) {
      project.files = files
      project.markModified('files')
    }

    if (dependencies !== undefined) {
      if (dependencies instanceof Map) {
        project.dependencies = dependencies
      } else if (typeof dependencies === 'object' && dependencies !== null) {
        project.dependencies = new Map(Object.entries(dependencies))
      }
      project.markModified('dependencies')
    }

    if (name !== undefined) project.name = name
    if (description !== undefined) project.description = description
    if (selectedFile !== undefined) project.selectedFile = selectedFile

    project = await project.save()

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    console.log("Project updated successfully:", project.projectId)
    res.json(project)
  } catch (error) {
    console.error("Error updating project:", error)
    res.status(500).json({ error: error.message })
  }
}

exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params
    const project = await Project.findOneAndDelete({ projectId })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    res.json({ message: "Project deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getUserProjects = async (req, res) => {
  try {
    const tokenUserId = getTokenUserId(req)
    if (!tokenUserId) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    const projects = await Project.find({ userId: tokenUserId })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
