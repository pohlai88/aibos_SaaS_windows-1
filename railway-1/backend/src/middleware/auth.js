const jwt = require('jsonwebtoken');
const { db } = require('../utils/supabase');

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await db.getUserById(decoded.userId);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      });
    }

    // Get tenant from database
    const { data: tenant, error: tenantError } = await db.getTenant(user.tenant_id);
    
    if (tenantError || !tenant) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - tenant not found'
      });
    }

    // Add user and tenant info to request
    req.user = {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenant_id: user.tenant_id
    };
    
    req.tenant = tenant;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Middleware to check if user has specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    
    if (!userPermissions.includes(permission) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: `Permission '${permission}' required`
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requirePermission
}; 