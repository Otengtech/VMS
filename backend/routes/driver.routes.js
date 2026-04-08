import express from 'express';
import {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getExpiredLicenses,
  toggleDriverStatus
} from '../controllers/driver.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDrivers);
router.get('/expired-licenses', getExpiredLicenses);
router.get('/:id', getDriver);
router.post('/', createDriver);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);
router.patch('/:id/toggle-status', toggleDriverStatus);

export default router;