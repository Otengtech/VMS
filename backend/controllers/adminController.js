// controllers/adminController.js
import User from "../models/User.js";
import Terminal from "../models/Terminal.js";
import bcrypt from "bcryptjs";

// @desc    Create new admin
// @route   POST /api/admin/create
// @access  Private/SuperAdmin
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, age, contact, dateOfBirth, terminalId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      age,
      contact,
      dateOfBirth,
      terminalId,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        terminalId: admin.terminalId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single admin
// @route   GET /api/admin/:id
// @access  Private/SuperAdmin
export const getAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id)
      .select("-password")
      .populate("terminalId");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin" });
    }

    res.json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all admins
// @route   GET /api/admin/all
// @access  Private/SuperAdmin
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("-password")
      .populate("terminalId");
    
    res.json(admins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete admin
// @route   DELETE /api/admin/:id
// @access  Private/SuperAdmin
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "superadmin") {
      return res.status(400).json({ message: "Cannot delete super admin" });
    }

    await admin.deleteOne();
    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};