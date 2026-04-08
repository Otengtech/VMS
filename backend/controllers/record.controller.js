import Record from '../models/Record.model.js';
import ActivityLog from '../models/ActivityLog.model.js';
import Vehicle from '../models/Vehicle.model.js';
import Driver from '../models/Driver.model.js';

// @desc    Get all records (with access control)
// @route   GET /api/records
// @access  Private
export const getRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.user.role === 'admin') {
      if (!req.user.terminalId) {
        return res.status(403).json({
          success: false,
          error: 'Admin not assigned to any terminal'
        });
      }
      query.terminalId = req.user.terminalId;
    }

    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.createdAt = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.createdAt = { $lte: new Date(req.query.endDate) };
    }

    if (req.query.action) {
      query.action = req.query.action;
    }

    if (req.query.vehicleId) {
      query.vehicleId = req.query.vehicleId;
    }

    if (req.query.driverId) {
      query.driverId = req.query.driverId;
    }

    if (req.query.search && req.query.search.trim()) {
      const searchTerm = req.query.search.trim();
      
      const matchingVehicles = await Vehicle.find({
        plateNumber: { $regex: searchTerm, $options: 'i' }
      }).select('_id');
      
      const matchingDrivers = await Driver.find({
        name: { $regex: searchTerm, $options: 'i' }
      }).select('_id');
      
      const vehicleIds = matchingVehicles.map(v => v._id);
      const driverIds = matchingDrivers.map(d => d._id);
      
      if (vehicleIds.length > 0 || driverIds.length > 0) {
        query.$or = [];
        if (vehicleIds.length > 0) query.$or.push({ vehicleId: { $in: vehicleIds } });
        if (driverIds.length > 0) query.$or.push({ driverId: { $in: driverIds } });
      } else {
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page,
          pages: 0,
          records: []
        });
      }
    }

    const records = await Record.find(query)
      .populate('vehicleId', 'plateNumber type')
      .populate('driverId', 'name phone licenseNumber')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name email role')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Record.countDocuments(query);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      records
    });
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single record
// @route   GET /api/records/:id
// @access  Private
export const getRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id)
      .populate('vehicleId', 'plateNumber type status')
      .populate('driverId', 'name phone licenseNumber status')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name email role');

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    if (req.user.role === 'admin') {
      if (!req.user.terminalId || 
          record.terminalId._id.toString() !== req.user.terminalId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only view records from your terminal.'
        });
      }
    }

    res.status(200).json({
      success: true,
      record
    });
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new record
// @route   POST /api/records
// @access  Private
export const createRecord = async (req, res) => {
  try {
    const { vehicleId, driverId, action, notes } = req.body;

    if (!vehicleId || !driverId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Please provide vehicleId, driverId, and action'
      });
    }

    if (!['check-in', 'check-out'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be either check-in or check-out'
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    let terminalId = req.body.terminalId;
    if (req.user.role === 'admin') {
      if (!req.user.terminalId) {
        return res.status(403).json({
          success: false,
          error: 'Admin not assigned to any terminal'
        });
      }
      terminalId = req.user.terminalId;
    }

    const record = await Record.create({
      vehicleId,
      driverId,
      terminalId,
      action,
      notes: notes || '',
      createdBy: req.user._id
    });

    const populatedRecord = await Record.findById(record._id)
      .populate('vehicleId', 'plateNumber type')
      .populate('driverId', 'name phone')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name');

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      terminalId: terminalId,
      action: 'create_record',
      entityType: 'record',
      entityId: record._id,
      details: `Created ${action} record for vehicle ${vehicle.plateNumber} with driver ${driver.name}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    res.status(201).json({
      success: true,
      record: populatedRecord,
      message: 'Record created successfully'
    });
  } catch (error) {
    console.error('Create record error:', error);
    
    try {
      await ActivityLog.create({
        user: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'create_record',
        entityType: 'record',
        details: `Failed to create record: ${error.message}`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'failed',
        errorMessage: error.message
      });
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update record
// @route   PUT /api/records/:id
// @access  Private (SuperAdmin only)
export const updateRecord = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only superadmins can update records.'
      });
    }

    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    const { notes, action } = req.body;
    const oldData = {
      action: record.action,
      notes: record.notes
    };

    if (action) record.action = action;
    if (notes !== undefined) record.notes = notes;

    await record.save();

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      terminalId: record.terminalId,
      action: 'update_record',
      entityType: 'record',
      entityId: record._id,
      details: `Updated record`,
      changes: req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    res.status(200).json({
      success: true,
      record,
      message: 'Record updated successfully'
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete record
// @route   DELETE /api/records/:id
// @access  Private (SuperAdmin only)
export const deleteRecord = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only superadmins can delete records.'
      });
    }

    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }

    await record.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      terminalId: record.terminalId,
      action: 'delete_record',
      entityType: 'record',
      entityId: record._id,
      details: `Deleted ${record.action} record`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get today's records
// @route   GET /api/records/today
// @access  Private
export const getTodaysRecords = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let query = {
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    };

    if (req.user.role === 'admin') {
      if (!req.user.terminalId) {
        return res.status(403).json({
          success: false,
          error: 'Admin not assigned to any terminal'
        });
      }
      query.terminalId = req.user.terminalId;
    }

    const records = await Record.find(query)
      .populate('vehicleId', 'plateNumber type')
      .populate('driverId', 'name phone')
      .populate('terminalId', 'name location')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    const checkIns = records.filter(r => r.action === 'check-in').length;
    const checkOuts = records.filter(r => r.action === 'check-out').length;

    res.status(200).json({
      success: true,
      total: records.length,
      checkIns,
      checkOuts,
      records
    });
  } catch (error) {
    console.error('Get today records error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get records summary (for dashboard)
// @route   GET /api/records/summary
// @access  Private
export const getRecordsSummary = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'admin') {
      if (!req.user.terminalId) {
        return res.status(403).json({
          success: false,
          error: 'Admin not assigned to any terminal'
        });
      }
      query.terminalId = req.user.terminalId;
    }

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const weeklyStats = await Record.aggregate([
      { $match: { ...query, createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            action: "$action"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          checkIns: {
            $sum: {
              $cond: [{ $eq: ["$_id.action", "check-in"] }, "$count", 0]
            }
          },
          checkOuts: {
            $sum: {
              $cond: [{ $eq: ["$_id.action", "check-out"] }, "$count", 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalCheckIns = await Record.countDocuments({ ...query, action: 'check-in' });
    const totalCheckOuts = await Record.countDocuments({ ...query, action: 'check-out' });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyCheckIns = await Record.countDocuments({ 
      ...query, 
      action: 'check-in',
      createdAt: { $gte: startOfMonth }
    });
    
    const monthlyCheckOuts = await Record.countDocuments({ 
      ...query, 
      action: 'check-out',
      createdAt: { $gte: startOfMonth }
    });

    res.status(200).json({
      success: true,
      summary: {
        total: totalCheckIns + totalCheckOuts,
        checkIns: totalCheckIns,
        checkOuts: totalCheckOuts,
        monthly: {
          checkIns: monthlyCheckIns,
          checkOuts: monthlyCheckOuts,
          total: monthlyCheckIns + monthlyCheckOuts
        },
        weeklyStats
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};