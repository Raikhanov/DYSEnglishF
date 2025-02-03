const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  title: String,
  description: String,
  filePath: String,
  fileType: String,
});

const Material = mongoose.model("Material", materialSchema);

module.exports = Material;
