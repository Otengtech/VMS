// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    fullName: String,
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["superadmin", "admin"],
      default: "admin"
    },
    age: Number,
    contact: String,
    dateOfBirth: Date,
    terminalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Terminal"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);