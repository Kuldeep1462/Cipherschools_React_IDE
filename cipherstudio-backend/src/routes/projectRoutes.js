const express = require("express")
const router = express.Router()
const projectController = require("../controllers/projectController")

router.post("/", projectController.createProject)
router.get("/:projectId", projectController.getProject)
router.put("/:projectId", projectController.updateProject)
router.delete("/:projectId", projectController.deleteProject)
router.get("/user/projects", projectController.getUserProjects)

module.exports = router
