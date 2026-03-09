// routes/adminRoutes.js
import express from "express";
import { createAdmin, getAllAdmins, deleteAdmin, getAdmin } from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("superadmin"));

router.post("/create", createAdmin);
router.get("/all", getAllAdmins);
router.get("/:id", getAdmin);
router.delete("/:id", deleteAdmin);

export default router;