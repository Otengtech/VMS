// models/Vehicle.js
import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
{
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  vehicleType: {
    type: String,
    enum: ["truck", "trailer", "container", "van"],
    default: "truck"
  },

  make: String,
  model: String,
  year: Number,
  color: String,

  capacity: Number, // tons

  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    default: null
  },

  status: {
    type: String,
    enum: ["active", "on-trip", "maintenance", "idle"],
    default: "idle"
  }
},
{ timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);