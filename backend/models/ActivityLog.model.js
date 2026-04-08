// models/ActivityLog.model.js
import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    enum: ['superadmin', 'admin'],
    required: true
  },
  terminalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terminal',
    default: null
  },
  action: {
    type: String,
    enum: [
      'login', 'logout',
      'view_records', 'create_record', 'update_record', 'delete_record',
      'create_vehicle', 'update_vehicle', 'delete_vehicle',
      'create_driver', 'update_driver', 'delete_driver',
      'create_user', 'update_user', 'delete_user',
      'export_data', 'view_report'
    ],
    required: true
  },
  entityType: {
    type: String,
    enum: ['record', 'vehicle', 'driver', 'user', 'terminal', 'report'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  details: {
    type: String,
    trim: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ terminalId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;