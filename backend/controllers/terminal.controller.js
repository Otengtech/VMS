import Terminal from '../models/Terminal.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Driver from '../models/Driver.model.js';
import Record from '../models/Record.model.js';

// @desc    Get all terminals
// @route   GET /api/terminals
// @access  Private
export const getTerminals = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'admin' && req.user.terminalId) {
      query._id = req.user.terminalId;
    }

    const terminals = await Terminal.find(query)
      .populate({
        path: 'vehicles',
        populate: { path: 'driverId', select: 'name phone' }
      })
      .populate('drivers');

    res.status(200).json({
      success: true,
      count: terminals.length,
      terminals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single terminal
// @route   GET /api/terminals/:id
// @access  Private
export const getTerminal = async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id)
      .populate({
        path: 'vehicles',
        populate: { path: 'driverId', select: 'name phone' }
      })
      .populate('drivers');

    if (!terminal) {
      return res.status(404).json({
        success: false,
        error: 'Terminal not found'
      });
    }

    res.status(200).json({
      success: true,
      terminal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create terminal
// @route   POST /api/terminals
// @access  Private/SuperAdmin
export const createTerminal = async (req, res) => {
  try {
    const terminal = await Terminal.create(req.body);
    
    res.status(201).json({
      success: true,
      terminal
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Terminal with this name already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update terminal
// @route   PUT /api/terminals/:id
// @access  Private/SuperAdmin
export const updateTerminal = async (req, res) => {
  try {
    const terminal = await Terminal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!terminal) {
      return res.status(404).json({
        success: false,
        error: 'Terminal not found'
      });
    }

    res.status(200).json({
      success: true,
      terminal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete terminal
// @route   DELETE /api/terminals/:id
// @access  Private/SuperAdmin
export const deleteTerminal = async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id);

    if (!terminal) {
      return res.status(404).json({
        success: false,
        error: 'Terminal not found'
      });
    }

    if (terminal.currentVehicles > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete terminal with vehicles currently checked in'
      });
    }

    const driversCount = await Driver.countDocuments({ terminalId: terminal._id });
    if (driversCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete terminal with registered drivers'
      });
    }

    await terminal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Terminal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Debug terminal stats
// @route   GET /api/terminals/:id/debug
// @access  Private
export const debugTerminalStats = async (req, res) => {
  try {
    const terminalId = req.params.id;
    
    const terminal = await Terminal.findById(terminalId);
    if (!terminal) {
      return res.status(404).json({ error: 'Terminal not found' });
    }
    
    const results = {
      terminal: terminal,
      vehicleCount: await Vehicle.countDocuments({ terminalId }),
      driverCount: await Driver.countDocuments({ terminalId }),
      recordCount: await Record.countDocuments({ terminalId })
    };
    
    res.json({
      success: true,
      debug: results
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get terminal statistics
// @route   GET /api/terminals/:id/stats
// @access  Private
export const getTerminalStats = async (req, res) => {
  try {
    const terminalId = req.params.id;

    const terminal = await Terminal.findById(terminalId);
    if (!terminal) {
      return res.status(404).json({
        success: false,
        error: 'Terminal not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get all stats in parallel
    const [
      totalVehicles,
      activeDrivers,
      totalDrivers,
      todayCheckIns,
      todayCheckOuts,
      weekCheckIns,
      weekCheckOuts,
      recentRecords,
      busCount,
      taxiCount,
      truckCount,
      privateCount
    ] = await Promise.all([
      Vehicle.countDocuments({ terminalId }),
      Driver.countDocuments({ terminalId, isActive: true }),
      Driver.countDocuments({ terminalId }),
      Record.countDocuments({ terminalId, action: 'check-in', createdAt: { $gte: today, $lt: tomorrow } }),
      Record.countDocuments({ terminalId, action: 'check-out', createdAt: { $gte: today, $lt: tomorrow } }),
      Record.countDocuments({ terminalId, action: 'check-in', createdAt: { $gte: startOfWeek, $lt: endOfWeek } }),
      Record.countDocuments({ terminalId, action: 'check-out', createdAt: { $gte: startOfWeek, $lt: endOfWeek } }),
      Record.find({ terminalId })
        .populate('vehicleId', 'plateNumber type')
        .populate('driverId', 'name phone')
        .populate('createdBy', 'name')
        .sort('-createdAt')
        .limit(10)
        .lean(),
      Vehicle.countDocuments({ terminalId, type: 'bus' }),
      Vehicle.countDocuments({ terminalId, type: 'taxi' }),
      Vehicle.countDocuments({ terminalId, type: 'truck' }),
      Vehicle.countDocuments({ terminalId, type: 'private' })
    ]);

    const currentVehicles = terminal.currentVehicles || 0;
    const capacity = terminal.capacity || 0;
    const occupancyRate = capacity > 0 ? ((currentVehicles / capacity) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      stats: {
        overview: {
          currentVehicles,
          capacity,
          availableSpots: capacity - currentVehicles,
          occupancyRate: parseFloat(occupancyRate),
          totalVehicles,
          activeDrivers,
          totalDrivers,
          inactiveDrivers: totalDrivers - activeDrivers
        },
        today: {
          checkIns: todayCheckIns,
          checkOuts: todayCheckOuts,
          total: todayCheckIns + todayCheckOuts
        },
        thisWeek: {
          checkIns: weekCheckIns,
          checkOuts: weekCheckOuts,
          total: weekCheckIns + weekCheckOuts
        },
        vehicleTypeBreakdown: {
          bus: busCount,
          taxi: taxiCount,
          truck: truckCount,
          private: privateCount
        },
        recentRecords
      }
    });

  } catch (error) {
    console.error('Error in getTerminalStats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};