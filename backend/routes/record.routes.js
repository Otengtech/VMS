import express from 'express';
import {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getTodaysRecords,
  getRecordsSummary
} from '../controllers/record.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getRecords);
router.get('/today', getTodaysRecords);
router.get('/summary', getRecordsSummary);
router.get('/:id', getRecord);
router.post('/', createRecord);
router.put('/:id', authorize('superadmin'), updateRecord);
router.delete('/:id', authorize('superadmin'), deleteRecord);

export default router;