const express = require('express');
const router = express.Router();

// Import shared library components
const { 
  auth, 
  user, 
  tenant, 
  security, 
  validation, 
  logger,
  events 
} = require('@aibos/shared');

// Database connection
const { db } = require('../utils/supabase');

// Enhanced login with shared library features
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input using shared validation
    const validationResult = validation.auth.validateLogin({ email, password });
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        error: validationResult.error 
      });
    }

    // Log login attempt
    logger.info('Login attempt', { email, ip: req.ip, userAgent: req.get('User-Agent') });

    // Special default user logic (for demo)
    if (email === 'jackwee@ai-bos.io' && password === 'Weepohlai88!') {
      const result = await handleDefaultUserLogin(email, password, req);
      return res.json(result);
    }

    // Regular login flow using shared auth
    const loginResult = await auth.login({
      email,
      password,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      db
    });

    if (!loginResult.success) {
      // Log failed login
      logger.warn('Login failed', { 
        email, 
        reason: loginResult.error,
        ip: req.ip 
      });
      
      return res.status(401).json(loginResult);
    }

    // Log successful login
    logger.info('Login successful', { 
      email, 
      userId: loginResult.data.user.user_id,
      tenantId: loginResult.data.tenant.tenant_id 
    });

    // Emit login event
    await events.emit('UserLoggedIn', {
      userId: loginResult.data.user.user_id,
      tenantId: loginResult.data.tenant.tenant_id,
      email: loginResult.data.user.email,
      timestamp: new Date().toISOString()
    });

    res.json(loginResult);

  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Enhanced registration with shared library features
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, tenant_name } = req.body;
    
    // Validate input using shared validation
    const validationResult = validation.auth.validateRegistration({ 
      email, 
      password, 
      name, 
      tenant_name 
    });
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        error: validationResult.error 
      });
    }

    // Log registration attempt
    logger.info('Registration attempt', { 
      email, 
      tenant_name,
      ip: req.ip 
    });

    // Use shared registration logic
    const registrationResult = await auth.register({
      email,
      password,
      name,
      tenant_name,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      db
    });

    if (!registrationResult.success) {
      logger.warn('Registration failed', { 
        email, 
        reason: registrationResult.error 
      });
      return res.status(400).json(registrationResult);
    }

    // Log successful registration
    logger.info('Registration successful', { 
      email, 
      userId: registrationResult.data.user.user_id,
      tenantId: registrationResult.data.tenant.tenant_id 
    });

    // Emit registration event
    await events.emit('UserRegistered', {
      userId: registrationResult.data.user.user_id,
      tenantId: registrationResult.data.tenant.tenant_id,
      email: registrationResult.data.user.email,
      tenantName: registrationResult.data.tenant.name,
      timestamp: new Date().toISOString()
    });

    res.json(registrationResult);

  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Enhanced get current user with shared library features
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    // Use shared auth to verify token
    const verifyResult = await auth.verifyToken(token);
    if (!verifyResult.success) {
      return res.status(401).json(verifyResult);
    }

    // Get enhanced user data using shared user management
    const userResult = await user.getUserWithPermissions({
      userId: verifyResult.data.user_id,
      tenantId: verifyResult.data.tenant_id,
      db
    });

    if (!userResult.success) {
      return res.status(404).json(userResult);
    }

    // Get tenant data
    const tenantResult = await tenant.getTenant({
      tenantId: verifyResult.data.tenant_id,
      db
    });

    if (!tenantResult.success) {
      return res.status(404).json(tenantResult);
    }

    // Log user data access
    logger.info('User data accessed', { 
      userId: verifyResult.data.user_id,
      tenantId: verifyResult.data.tenant_id 
    });

    res.json({
      success: true,
      data: {
        user: userResult.data,
        tenant: tenantResult.data
      }
    });

  } catch (error) {
    logger.error('Get user error', { error: error.message, stack: error.stack });
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Enhanced logout with shared library features
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    // Use shared auth to verify and invalidate token
    const logoutResult = await auth.logout(token);
    
    if (!logoutResult.success) {
      return res.status(401).json(logoutResult);
    }

    // Log logout
    logger.info('User logged out', { 
      userId: logoutResult.data.user_id,
      tenantId: logoutResult.data.tenant_id 
    });

    // Emit logout event
    await events.emit('UserLoggedOut', {
      userId: logoutResult.data.user_id,
      tenantId: logoutResult.data.tenant_id,
      timestamp: new Date().toISOString()
    });

    res.json(logoutResult);

  } catch (error) {
    logger.error('Logout error', { error: error.message, stack: error.stack });
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Security audit endpoint
router.get('/audit', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    // Verify admin permissions
    const verifyResult = await auth.verifyToken(token);
    if (!verifyResult.success || verifyResult.data.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Admin access required' 
      });
    }

    // Get security audit data
    const auditResult = await security.getAuditLogs({
      tenantId: verifyResult.data.tenant_id,
      db
    });

    res.json(auditResult);

  } catch (error) {
    logger.error('Audit error', { error: error.message, stack: error.stack });
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Helper function for default user login
async function handleDefaultUserLogin(email, password, req) {
  try {
    // Try to get user
    let userResult = await db.getUserByEmail(email);
    let user = userResult.data;
    let tenant;
    
    if (!user) {
      // Create tenant using shared tenant management
      const tenantResult = await tenant.createTenant({
        name: 'Default Tenant',
        status: 'active',
        settings: {},
        db
      });
      
      if (!tenantResult.success) {
        return { success: false, error: 'Failed to create tenant' };
      }
      
      tenant = tenantResult.data;
      
      // Create user using shared user management
      const userResult = await user.createUser({
        email,
        name: 'Default Admin',
        role: 'admin',
        permissions: ['read', 'write', 'admin'],
        tenantId: tenant.tenant_id,
        password,
        db
      });
      
      if (!userResult.success) {
        return { success: false, error: 'Failed to create user' };
      }
      
      user = userResult.data;
    } else {
      // Get tenant
      const tenantResult = await tenant.getTenant({
        tenantId: user.tenant_id,
        db
      });
      
      if (!tenantResult.success) {
        return { success: false, error: 'Tenant not found' };
      }
      
      tenant = tenantResult.data;
    }

    // Generate token using shared auth
    const tokenResult = await auth.generateToken({
      userId: user.user_id,
      tenantId: user.tenant_id,
      email: user.email,
      role: user.role
    });

    if (!tokenResult.success) {
      return { success: false, error: 'Failed to generate token' };
    }

    return {
      success: true,
      data: {
        token: tokenResult.data.token,
        user: {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        },
        tenant: {
          tenant_id: tenant.tenant_id,
          name: tenant.name,
          status: tenant.status
        }
      },
      message: 'Login successful (default admin)'
    };

  } catch (error) {
    logger.error('Default user login error', { error: error.message });
    return { success: false, error: 'Internal server error' };
  }
}

module.exports = router; 