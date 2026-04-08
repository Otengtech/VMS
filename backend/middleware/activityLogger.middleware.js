// middleware/activityLogger.js
import ActivityLog from '../models/ActivityLog.model.js';

export const logActivity = (action, entityType, getDetails = null) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.json;
    
    // Override json method to capture response
    res.json = function(data) {
      // Check if operation was successful
      const isSuccess = data.success === true;
      
      // Log activity asynchronously (don't wait for it)
      const logEntry = {
        user: req.user?._id,
        userName: req.user?.name || 'Unknown',
        userRole: req.user?.role || 'unknown',
        terminalId: req.user?.terminalId || null,
        action: action,
        entityType: entityType,
        entityId: req.params.id || req.body?._id || null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: isSuccess ? 'success' : 'failed'
      };
      
      // Add custom details if provided
      if (getDetails) {
        const details = getDetails(req, res, data);
        if (details) {
          logEntry.details = details;
        }
      }
      
      // Add changes for update operations
      if (req.method === 'PUT' || req.method === 'PATCH') {
        logEntry.changes = req.body;
      }
      
      // Add error message if failed
      if (!isSuccess && data.error) {
        logEntry.errorMessage = data.error;
      }
      
      // Save log asynchronously
      ActivityLog.create(logEntry).catch(err => 
        console.error('Failed to save activity log:', err)
      );
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware to log all requests
export const logAllRequests = async (req, res, next) => {
  // Don't log GET requests for performance
  const skipMethods = ['GET', 'OPTIONS', 'HEAD'];
  if (skipMethods.includes(req.method)) {
    return next();
  }
  
  // Determine action and entity based on route
  let action = 'unknown';
  let entityType = 'unknown';
  
  const path = req.path;
  const method = req.method;
  
  if (path.includes('/records')) {
    entityType = 'record';
    if (method === 'POST') action = 'create_record';
    else if (method === 'PUT' || method === 'PATCH') action = 'update_record';
    else if (method === 'DELETE') action = 'delete_record';
  } else if (path.includes('/vehicles')) {
    entityType = 'vehicle';
    if (method === 'POST') action = 'create_vehicle';
    else if (method === 'PUT' || method === 'PATCH') action = 'update_vehicle';
    else if (method === 'DELETE') action = 'delete_vehicle';
  } else if (path.includes('/drivers')) {
    entityType = 'driver';
    if (method === 'POST') action = 'create_driver';
    else if (method === 'PUT' || method === 'PATCH') action = 'update_driver';
    else if (method === 'DELETE') action = 'delete_driver';
  } else if (path.includes('/auth')) {
    entityType = 'user';
    if (path.includes('/login')) action = 'login';
    else if (path.includes('/logout')) action = 'logout';
    else if (method === 'POST') action = 'create_user';
    else if (method === 'PUT') action = 'update_user';
    else if (method === 'DELETE') action = 'delete_user';
  } else if (path.includes('/export')) {
    entityType = 'report';
    action = 'export_data';
  }
  
  // Apply log middleware for non-GET requests
  return logActivity(action, entityType)(req, res, next);
};