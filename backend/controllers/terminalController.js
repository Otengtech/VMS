// controllers/terminalController.js
import Terminal from "../models/Terminal.js";
import User from "../models/User.js";

// @desc    Create terminal
// @route   POST /api/terminal/create
// @access  Private/Admin
export const createTerminal = async (req, res) => {
  try {
    const { name, location, address } = req.body;

    const terminal = await Terminal.create({
      name,
      location,
      address,
      adminId: req.user.role === "admin" ? req.user._id : req.body.adminId
    });

    // If admin is creating terminal, assign it to them
    if (req.user.role === "admin") {
      await User.findByIdAndUpdate(req.user._id, { terminalId: terminal._id });
    }

    res.status(201).json({
      message: "Terminal created successfully",
      terminal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all terminals
// @route   GET /api/terminal/all
// @access  Private
export const getAllTerminals = async (req, res) => {
  try {
    let terminals;
    
    if (req.user.role === "superadmin") {
      terminals = await Terminal.find().populate("adminId", "name email");
    } else {
      terminals = await Terminal.find({ adminId: req.user._id });
    }
    
    res.json(terminals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get terminal by ID
// @route   GET /api/terminal/:id
// @access  Private
export const getTerminalById = async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id)
      .populate("adminId", "name email");
    
    if (!terminal) {
      return res.status(404).json({ message: "Terminal not found" });
    }

    // Check if user has access to this terminal
    if (req.user.role !== "superadmin" && 
        terminal.adminId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(terminal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update terminal
// @route   PUT /api/terminal/:id
// @access  Private
export const updateTerminal = async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id);
    
    if (!terminal) {
      return res.status(404).json({ message: "Terminal not found" });
    }

    // Check authorization
    if (req.user.role !== "superadmin" && 
        terminal.adminId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedTerminal = await Terminal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Terminal updated successfully",
      terminal: updatedTerminal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete terminal
// @route   DELETE /api/terminal/:id
// @access  Private/SuperAdmin
export const deleteTerminal = async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id);
    
    if (!terminal) {
      return res.status(404).json({ message: "Terminal not found" });
    }

    await terminal.deleteOne();
    
    // Remove terminal reference from admin
    await User.updateMany(
      { terminalId: terminal._id },
      { $unset: { terminalId: "" } }
    );

    res.json({ message: "Terminal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};