// models/VehicleRecord.js
import mongoose from "mongoose";

const vehicleRecordSchema = new mongoose.Schema(
{
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true
  },

  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver"
  },

  registrationNumber: String,

  driverName: String,

  route: String,

  startLocation: String,
  endLocation: String,

  date: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["active", "in-transit", "maintenance", "completed", "delayed"],
    default: "active"
  },

  distance: Number, // km

  fuelUsed: Number, // litres

  passengers: Number,

  notes: String
},
{ timestamps: true }
);

export default mongoose.model("VehicleRecord", vehicleRecordSchema);