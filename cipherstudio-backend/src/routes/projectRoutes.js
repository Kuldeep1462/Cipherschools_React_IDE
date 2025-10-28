const express = require("express")
const router = express.Router()
// Use the clean controller implementation to avoid duplicate legacy content
const projectController = require("../controllers/projectController.clean")

// Note: define specific routes BEFORE parameterized ones to avoid conflicts
router.post("/", projectController.createProject)
router.get("/user/projects", projectController.getUserProjects)
router.get("/:projectId", projectController.getProject)
router.put("/:projectId", projectController.updateProject)
router.delete("/:projectId", projectController.deleteProject)

module.exports = router
