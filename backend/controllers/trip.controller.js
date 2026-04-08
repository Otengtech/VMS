import Trip from '../models/Trip.model.js';
import Vehicle from '../models/Vehicle.model.js';

// Start a new trip (vehicle leaves terminal)
export const startTrip = async (req, res) => {
  try {
    const {
      vehicleId,
      driverId,
      destination,
      passengersCount,
      cargoType,
      cargoWeight,
      notes,
      fuelStart,
      odometerStart
    } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Vehicle must be checked-in (available at terminal) to start a trip
    if (vehicle.status !== 'checked-in') {
      return res.status(400).json({ 
        error: `Vehicle is ${vehicle.status}. Only checked-in vehicles can start trips.` 
      });
    }

    // Check if driver is already on an active trip
    const activeDriverTrip = await Trip.findOne({
      driverId,
      status: 'active'
    });

    if (activeDriverTrip) {
      return res.status(400).json({ 
        error: 'Driver is already on an active trip' 
      });
    }

    // Create the trip
    const trip = new Trip({
      vehicleId,
      driverId,
      terminalId: vehicle.terminalId,
      destination,
      passengers: {
        count: passengersCount || 0,
        details: [],
        totalFare: 0
      },
      cargo: cargoType || '',
      cargoWeight: cargoWeight || 0,
      notes: notes || '',
      fuelStart: fuelStart || 0,
      odometerStart: odometerStart || 0,
      departureTime: new Date(),
      status: 'active',
      createdBy: req.user._id
    });

    await trip.save();

    // Update vehicle status to 'on-trip' or 'checked-out'
    vehicle.status = 'checked-out'; // Vehicle is now on the road
    vehicle.driverId = driverId;
    await vehicle.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicleId', 'plateNumber type')
      .populate('driverId', 'name phone licenseNumber')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Trip started successfully',
      trip: populatedTrip
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Complete trip (vehicle returns to terminal)
export const completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      returnTime,
      passengersCount,
      totalFare,
      fuelEnd,
      odometerEnd,
      issues,
      notes
    } = req.body;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.status !== 'active') {
      return res.status(400).json({ 
        error: `Trip is already ${trip.status}` 
      });
    }

    // Update trip details
    trip.returnTime = returnTime || new Date();
    trip.status = 'completed';
    trip.completedBy = req.user._id;
    
    if (passengersCount !== undefined) {
      trip.passengers.count = passengersCount;
    }
    if (totalFare !== undefined) {
      trip.passengers.totalFare = totalFare;
    }
    
    if (fuelEnd !== undefined) trip.fuelEnd = fuelEnd;
    if (odometerEnd !== undefined) trip.odometerEnd = odometerEnd;
    if (issues) trip.issues = issues;
    if (notes) trip.notes = notes;

    await trip.save();

    // Vehicle returns to terminal - status becomes 'checked-in'
    const vehicle = await Vehicle.findById(trip.vehicleId);
    if (vehicle) {
      vehicle.status = 'checked-in';
      vehicle.driverId = null; // Driver is no longer assigned to this vehicle
      vehicle.checkInTime = new Date();
      await vehicle.save();
    }

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicleId', 'plateNumber type')
      .populate('driverId', 'name phone licenseNumber')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email');

    res.json({
      message: 'Trip completed successfully',
      trip: populatedTrip
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get all trips with filters
export const getTrips = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate, 
      vehicleId, 
      driverId,
      terminalId 
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (vehicleId) filter.vehicleId = vehicleId;
    if (driverId) filter.driverId = driverId;
    
    let terminalQuery = terminalId;
    if (req.user.role === 'admin' && req.user.terminalId) {
      terminalQuery = req.user.terminalId;
    }
    if (terminalQuery) filter.terminalId = terminalQuery;
    
    if (startDate || endDate) {
      filter.departureTime = {};
      if (startDate) filter.departureTime.$gte = new Date(startDate);
      if (endDate) filter.departureTime.$lte = new Date(endDate);
    }

    const trips = await Trip.find(filter)
      .populate('vehicleId', 'plateNumber type')
      .populate('driverId', 'name phone licenseNumber')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .sort({ departureTime: -1 });

    res.json({ trips });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get single trip
export const getTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id)
      .populate('vehicleId', 'plateNumber type')
      .populate('driverId', 'name phone licenseNumber')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email');

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (req.user.role === 'admin' && req.user.terminalId && 
        trip.terminalId._id.toString() !== req.user.terminalId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ trip });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Cancel trip
export const cancelTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.status !== 'active') {
      return res.status(400).json({ 
        error: `Cannot cancel trip with status: ${trip.status}` 
      });
    }

    trip.status = 'cancelled';
    trip.notes = reason ? `Cancelled: ${reason}` : trip.notes;
    await trip.save();

    // Vehicle becomes checked-in (available) after cancellation
    const vehicle = await Vehicle.findById(trip.vehicleId);
    if (vehicle) {
      vehicle.status = 'checked-in';
      vehicle.driverId = null;
      await vehicle.save();
    }

    res.json({
      message: 'Trip cancelled successfully',
      trip
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get active trips
export const getActiveTrips = async (req, res) => {
  try {
    let filter = { status: 'active' };
    
    if (req.user.role === 'admin' && req.user.terminalId) {
      filter.terminalId = req.user.terminalId;
    }

    const trips = await Trip.find(filter)
      .populate('vehicleId', 'plateNumber type')
      .populate('driverId', 'name phone licenseNumber')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name email')
      .sort({ departureTime: 1 });

    res.json({ trips });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get trip statistics
export const getTripStats = async (req, res) => {
  try {
    const { terminalId, startDate, endDate } = req.query;

    const filter = {};
    
    let terminalQuery = terminalId;
    if (req.user.role === 'admin' && req.user.terminalId) {
      terminalQuery = req.user.terminalId;
    }
    if (terminalQuery) filter.terminalId = terminalQuery;
    
    if (startDate || endDate) {
      filter.departureTime = {};
      if (startDate) filter.departureTime.$gte = new Date(startDate);
      if (endDate) filter.departureTime.$lte = new Date(endDate);
    }

    const stats = await Trip.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPassengers: { $sum: '$passengers.count' },
          totalFare: { $sum: '$passengers.totalFare' }
        }
      }
    ]);

    const totalTrips = await Trip.countDocuments(filter);
    const activeTrips = await Trip.countDocuments({ ...filter, status: 'active' });
    const completedTrips = await Trip.countDocuments({ ...filter, status: 'completed' });

    res.json({
      stats,
      totalTrips,
      activeTrips,
      completedTrips
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};