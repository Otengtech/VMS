import express from "express";
import {
  getVehicleRecords,
  getVehicleRecordById,
  createVehicleRecord,
  updateVehicleRecord,
  deleteVehicleRecord
} from "../controllers/vehicleRecord.js";

const router = express.Router();

router.get("/", getVehicleRecords);
router.get("/:id", getVehicleRecordById);
router.post("/", createVehicleRecord);
router.put("/:id", updateVehicleRecord);
router.delete("/:id", deleteVehicleRecord);

export default router;