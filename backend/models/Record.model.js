// models/Record.model.js
import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle ID is required']
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: [true, 'Driver ID is required']
  },
  terminalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terminal',
    required: [true, 'Terminal ID is required']
  },
  action: {
    type: String,
    enum: ['check-in', 'check-out'],
    required: [true, 'Action is required']
  },
  notes: {
    type: String,
    trim: true,
    default: '',
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

// Indexes for faster queries
recordSchema.index({ terminalId: 1, createdAt: -1 });
recordSchema.index({ vehicleId: 1, createdAt: -1 });
recordSchema.index({ driverId: 1, createdAt: -1 });
recordSchema.index({ action: 1, createdAt: -1 });
recordSchema.index({ createdAt: -1 });

// Compound index for common queries
recordSchema.index({ terminalId: 1, action: 1, createdAt: -1 });

const Record = mongoose.model('Record', recordSchema);
export default Record;