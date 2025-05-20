import mongoose from "mongoose";

const ComponentSchema = new mongoose.Schema({
  model: String,
  type: String,
  health: Number,
  targetStat: String,
  value: Number,
  isFunctionnal: Boolean
});

const ComponentModel = mongoose.model("Component", ComponentSchema);

export default ComponentModel;
