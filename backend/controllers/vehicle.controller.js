import Vehicle from '../models/Vehicle.model.js';
import Record from '../models/Record.model.js';
import Driver from '../models/Driver.model.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
export const getVehicles = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'admin' && req.user.terminalId) {
      query.terminalId = req.user.terminalId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.search) {
      query.plateNumber = { $regex: req.query.search, $options: 'i' };
    }

    const vehicles = await Vehicle.find(query)
      .populate('driverId', 'name phone licenseNumber')
      .populate('terminalId', 'name location')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
export const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('driverId')
      .populate('terminalId', 'name location');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    const history = await Record.find({ vehicleId: vehicle._id })
      .populate('driverId', 'name phone')
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .limit(20);

    res.status(200).json({
      success: true,
      vehicle,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create vehicle
// @route   POST /api/vehicles
// @access  Private
export const createVehicle = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      req.body.terminalId = req.user.terminalId;
    }

    if (req.body.driverId) {
      const driver = await Driver.findOne({
        _id: req.body.driverId,
        terminalId: req.body.terminalId
      });

      if (!driver) {
        return res.status(400).json({
          success: false,
          error: 'Driver not found or does not belong to this terminal'
        });
      }

      const existingVehicle = await Vehicle.findOne({
        driverId: req.body.driverId,
        status: 'checked-in'
      });

      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          error: 'Driver already has an active vehicle'
        });
      }
    }

    const vehicle = await Vehicle.create(req.body);

    res.status(201).json({
      success: true,
      vehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle with this plate number already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('driverId', 'name phone')
      .populate('terminalId', 'name location');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    if (vehicle.status === 'checked-in') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete vehicle that is currently checked in. Please check out first.'
      });
    }

    await vehicle.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Check-in vehicle
// @route   POST /api/vehicles/check-in
// @access  Private
export const checkInVehicle = async (req, res) => {
  try {
    const { vehicleId, driverId, notes } = req.body;

    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      status: 'checked-out'
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found or already checked in'
      });
    }

    vehicle.status = 'checked-in';
    vehicle.driverId = driverId;
    vehicle.checkInTime = new Date();
    await vehicle.save();

    const record = await Record.create({
      vehicleId,
      driverId,
      terminalId: vehicle.terminalId,
      action: 'check-in',
      notes,
      createdBy: req.user._id
    });

    res.status(200).json({ success: true, vehicle, record });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Check-out vehicle
// @route   POST /api/vehicles/check-out
// @access  Private
export const checkOutVehicle = async (req, res) => {
  try {
    const { vehicleId, notes } = req.body;

    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle ID is required'
      });
    }

    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      status: 'checked-in'
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found or not checked in'
      });
    }

    const driverId = vehicle.driverId;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        error: 'No driver assigned to this vehicle'
      });
    }

    vehicle.status = 'checked-out';
    vehicle.driverId = null;
    vehicle.checkOutTime = new Date();
    await vehicle.save();

    const record = await Record.create({
      vehicleId,
      driverId,
      terminalId: vehicle.terminalId,
      action: 'check-out',
      notes,
      createdBy: req.user._id
    });

    res.status(200).json({ success: true, vehicle, record });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get vehicles currently checked in
// @route   GET /api/vehicles/checked-in
// @access  Private
export const getCheckedInVehicles = async (req, res) => {
  try {
    let query = { status: 'checked-in' };

    if (req.user.role === 'admin' && req.user.terminalId) {
      query.terminalId = req.user.terminalId;
    }

    const vehicles = await Vehicle.find(query)
      .populate('driverId', 'name phone')
      .populate('terminalId', 'name location')
      .sort('-checkInTime');

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};