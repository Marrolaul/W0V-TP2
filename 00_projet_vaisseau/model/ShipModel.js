import mongoose from "mongoose";

const ShipSchema = new mongoose.Schema({
  name: String,
  type: String,
  stats: {
    baseHealth: Number,
    health: Number,
    speed: Number,
    acceleration: Number,
    shield: Number,
    detection: Number,
    stealth: Number,
    maneuverability: Number
  },
  componentSlots: {
    thruster: { type: mongoose.SchemaTypes.ObjectId, ref: "component" },
    hull: { type: mongoose.SchemaTypes.ObjectId, ref: "component" },
    shield: { type: mongoose.SchemaTypes.ObjectId, ref: "component" },
    engine: { type: mongoose.SchemaTypes.ObjectId, ref: "component" },
    weapon: { type: mongoose.SchemaTypes.ObjectId, ref: "component" },
    radar: { type: mongoose.SchemaTypes.ObjectId, ref: "component" },
    navigation: { type: mongoose.SchemaTypes.ObjectId, ref: "component" },
  },
});

const ShipModel = mongoose.model("Ship", ShipSchema);

export default ShipModel;
