const mongoose = require("mongoose")

const fileSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: String,
  content: String,
  language: String,
})

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    files: [fileSchema],
    dependencies: {
      type: Map,
      of: String,
      default: new Map(),
    },
    selectedFile: String, // id of the selected file
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Project", projectSchema)
