// models/Driver.js
import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
{
  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true
  },

  phone: String,

  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },

  licenseExpiry: Date,

  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active"
  },

  vehicleAssigned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    default: null
  },

  terminal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Terminal"
  },

  address: String,

  emergencyContact: String,
  emergencyPhone: String,

  notes: String
},
{ timestamps: true }
);

export default mongoose.model("Driver", driverSchema);