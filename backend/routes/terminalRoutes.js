// routes/terminalRoutes.js
import express from "express";
import {
  createTerminal,
  getAllTerminals,
  getTerminalById,
  updateTerminal,
  deleteTerminal
} from "../controllers/terminalController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/create", authorize("admin", "superadmin"), createTerminal);
router.get("/all", authorize("admin", "superadmin"), getAllTerminals);
router.get("/:id", authorize("admin", "superadmin"), getTerminalById);
router.put("/:id", authorize("admin", "superadmin"), updateTerminal);
router.delete("/:id", authorize("superadmin"), deleteTerminal);

export default router;