import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  seatNumber: { type: String },
  fare: { type: Number }
});

const tripSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  terminalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terminal',
    required: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  departureTime: {
    type: Date,
    default: Date.now
  },
  returnTime: {
    type: Date
  },
  passengers: {
    count: {
      type: Number,
      required: true,
      min: 0
    },
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  },
  issues: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
tripSchema.index({ vehicleId: 1, status: 1 });
tripSchema.index({ driverId: 1, status: 1 });
tripSchema.index({ departureTime: -1 });

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;