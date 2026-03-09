// models/Terminal.js
import mongoose from "mongoose";

const terminalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    location: String,
    address: String,
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Terminal", terminalSchema);