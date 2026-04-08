import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// validation.middleware.js

// For CREATE user - password REQUIRED
export const validateUserCreate = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['superadmin', 'admin']).withMessage('Invalid role'),
  handleValidationErrors
];

// For UPDATE user - password OPTIONAL
export const validateUserUpdate = [
  body('name').optional().trim(),
  body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['superadmin', 'admin']).withMessage('Invalid role'),
  handleValidationErrors
];

// Keep original for backward compatibility if needed
export const validateUser = validateUserCreate;

// Terminal validation
export const validateTerminal = [
  body('name').notEmpty().withMessage('Terminal name is required').trim(),
  body('location').notEmpty().withMessage('Location is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
  handleValidationErrors
];

// Driver validation
export const validateDriver = [
  body('name').notEmpty().withMessage('Driver name is required').trim(),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('licenseNumber').notEmpty().withMessage('License number is required'),
  body('licenseExpiry').isISO8601().withMessage('Valid license expiry date is required'),
  body('terminalId').notEmpty().withMessage('Terminal ID is required'),
  handleValidationErrors
];

// Vehicle validation
export const validateVehicle = [
  body('plateNumber').notEmpty().withMessage('Plate number is required').toUpperCase(),
  body('type').isIn(['bus', 'taxi', 'truck', 'private']).withMessage('Invalid vehicle type'),
  body('driverId').notEmpty().withMessage('Driver ID is required'),
  body('terminalId').notEmpty().withMessage('Terminal ID is required'),
  handleValidationErrors
];

// Login validation
export const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Check-in validation (requires driverId)
export const validateCheckIn = [
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
  body('driverId').notEmpty().withMessage('Driver ID is required'),
  body('notes').optional().trim(),
  handleValidationErrors
];

// Check-out validation (driverId is optional since it comes from the vehicle)
export const validateCheckOut = [
  body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
  body('driverId').optional(), // Make driverId optional for check-out
  body('notes').optional().trim(),
  handleValidationErrors
];