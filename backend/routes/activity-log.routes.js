import express from 'express';
import {
  getActivityLogs,
  getActivityLog,
  getUserActivityLogs,
  getTerminalActivityLogs,
  getActivitySummary
} from '../controllers/activity-log.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('superadmin'), getActivityLogs);
router.get('/summary', authorize('superadmin'), getActivitySummary);
router.get('/user/:userId', getUserActivityLogs);
router.get('/terminal/:terminalId', getTerminalActivityLogs);
router.get('/:id', getActivityLog);

export default router;