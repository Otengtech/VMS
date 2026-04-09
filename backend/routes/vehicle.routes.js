// vehicle.routes.js
import express from 'express';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  checkInVehicle,
  checkOutVehicle,
  getCheckedInVehicles
} from '../controllers/vehicle.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// These routes MUST come before the /:id routes
router.post('/check-in', checkInVehicle);  // Make sure this is BEFORE /:id
router.post('/check-out', checkOutVehicle);
router.get('/checked-in', getCheckedInVehicles);

// Then the parameterized routes
router.get('/', getVehicles);
router.get('/:id', getVehicle);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;