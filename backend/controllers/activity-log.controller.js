import ActivityLog from '../models/ActivityLog.model.js';

// @desc    Get all activity logs
// @route   GET /api/activity-logs
// @access  Private/SuperAdmin
export const getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.userId) {
      query.user = req.query.userId;
    }

    if (req.query.terminalId) {
      query.terminalId = req.query.terminalId;
    }

    if (req.query.action) {
      query.action = req.query.action;
    }

    if (req.query.entityType) {
      query.entityType = req.query.entityType;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .populate('terminalId', 'name location')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single activity log
// @route   GET /api/activity-logs/:id
// @access  Private/SuperAdmin
export const getActivityLog = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('terminalId', 'name location');

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Activity log not found'
      });
    }

    res.status(200).json({
      success: true,
      log
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user activity logs
// @route   GET /api/activity-logs/user/:userId
// @access  Private
export const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check permission
    if (req.user.role !== 'superadmin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own activity logs.'
      });
    }

    const logs = await ActivityLog.find({ user: userId })
      .populate('terminalId', 'name location')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (error) {
    console.error('Get user activity logs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get terminal activity logs
// @route   GET /api/activity-logs/terminal/:terminalId
// @access  Private
export const getTerminalActivityLogs = async (req, res) => {
  try {
    const { terminalId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check permission
    if (req.user.role === 'admin' && req.user.terminalId?.toString() !== terminalId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view logs for your own terminal.'
      });
    }

    const logs = await ActivityLog.find({ terminalId })
      .populate('user', 'name email role')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments({ terminalId });

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (error) {
    console.error('Get terminal activity logs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get activity summary
// @route   GET /api/activity-logs/summary
// @access  Private/SuperAdmin
export const getActivitySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const [totalLogs, todayLogs, weekLogs, actionBreakdown] = await Promise.all([
      ActivityLog.countDocuments(),
      ActivityLog.countDocuments({ createdAt: { $gte: today } }),
      ActivityLog.countDocuments({ createdAt: { $gte: thisWeek } }),
      ActivityLog.aggregate([
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.status(200).json({
      success: true,
      summary: {
        total: totalLogs,
        today: todayLogs,
        thisWeek: weekLogs,
        topActions: actionBreakdown
      }
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};