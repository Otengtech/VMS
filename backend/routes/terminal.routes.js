import express from 'express';
import {
  getTerminals,
  getTerminal,
  createTerminal,
  updateTerminal,
  deleteTerminal,
  getTerminalStats,
  debugTerminalStats
} from '../controllers/terminal.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTerminals);
router.get('/:id', getTerminal);
router.get('/:id/stats', getTerminalStats);
router.get('/:id/debug', debugTerminalStats);

// Superadmin only routes
router.post('/', authorize('superadmin'), createTerminal);
router.put('/:id', authorize('superadmin'), updateTerminal);
router.delete('/:id', authorize('superadmin'), deleteTerminal);

export default router;