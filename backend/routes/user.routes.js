import express from 'express';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('superadmin'));

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;