const Project = require("../models/Project")
const { v4: uuidv4 } = require("uuid")

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body
    const userId = req.headers["user-id"]

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

    // Use findOne and save to ensure proper handling of Map/arrays
    let project = await Project.findOne({ projectId })
    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }
    
    // Update fields individually to ensure Mongoose marks them modified
    if (Array.isArray(files)) {
      project.files = files
      project.markModified('files')
    }

    if (dependencies !== undefined) {
      // Accept both Map and plain objects
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
    
    // Save the updated document
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
    const userId = req.headers["user-id"]
    const projects = await Project.find({ userId })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
