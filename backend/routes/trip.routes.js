import express from 'express';
import {
  startTrip,
  completeTrip,
  getTrips,
  getTrip,
  cancelTrip,
  getActiveTrips,
  getTripStats
} from '../controllers/trip.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/start', startTrip);
router.post('/:id/complete', completeTrip);
router.post('/:id/cancel', cancelTrip);
router.get('/', getTrips);
router.get('/active', getActiveTrips);
router.get('/stats', getTripStats);
router.get('/:id', getTrip);

export default router;