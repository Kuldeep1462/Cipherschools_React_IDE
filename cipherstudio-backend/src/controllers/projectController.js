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

/*
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
*/

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
/*
const Project = require("../models/Project")
const { v4: uuidv4 } = require("uuid")
const jwt = require("jsonwebtoken")

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
*/
/*
const Project = require("../models/Project")
const { v4: uuidv4 } = require("uuid")
const jwt = require("jsonwebtoken")

const resolveUserId = (req) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"]
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "")
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
      if (decoded?.userId) return decoded.userId
    }
  } catch (e) {
    // ignore token errors and fall back to header
  }
  return req.headers["user-id"]
}
*/

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body
    const userId = resolveUserId(req)

    const projectId = uuidv4()

    const defaultFiles = [
      {
        id: uuidv4(),
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
        name: "App.jsx",
        type: "file",
        language: "jsx",
        content: `export default function App() {
          const tokenUserId = getTokenUserId(req)
          const headerUserId = req.headers["user-id"]
          const userId = tokenUserId || headerUserId
          const isGuest = !tokenUserId
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
      // Signed-in users' projects are private by default; guest projects public
      isPublic: !(userId && !String(userId).startsWith('guest-')),
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
            isPublic: isGuest,

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }
    // Enforce privacy: if project isn't public, only owner may access
    if (!project.isPublic) {
      const userId = resolveUserId(req)
      if (!userId || String(userId) !== String(project.userId)) {
        return res.status(403).json({ error: "Forbidden" })
      }
    }

    res.json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
          // Enforce privacy: if project isn't public, only owner (by JWT) may access
          if (!project.isPublic) {
            const tokenUserId = getTokenUserId(req)
            if (!tokenUserId || String(tokenUserId) !== String(project.userId)) {
              return res.status(403).json({ error: "Forbidden" })
            }
          }
    console.log("Received data:", { filesCount: files?.length, dependencies, name, description, selectedFile })

    // Use findOne and save to ensure proper handling of Map/arrays
    let project = await Project.findOne({ projectId })
    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }
    
    // Update fields individually to ensure Mongoose marks them modified
          const tokenUserId = getTokenUserId(req)
          if (!tokenUserId) {
            return res.status(401).json({ error: "Unauthorized" })
          }
          const projects = await Project.find({ userId: tokenUserId })
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
    const userId = resolveUserId(req)
    if (!userId) {
      return res.status(400).json({ error: "User id missing" })
    }
    const projects = await Project.find({ userId })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
