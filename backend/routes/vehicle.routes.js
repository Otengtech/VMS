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

router.get('/', getVehicles);
router.get('/checked-in', getCheckedInVehicles);
router.get('/:id', getVehicle);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);
router.post('/check-in', checkInVehicle);
router.post('/check-out', checkOutVehicle);

export default router;