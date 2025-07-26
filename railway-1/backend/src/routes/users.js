const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for user management routes');
} catch (error) {
  console.error('❌ Failed to initialize AI Database System:', error.message);
  aiDatabaseSystem = null;
}

// Database connection
let db;
try {
  const supabaseModule = require('../utils/supabase');
  db = supabaseModule.db;
} catch (error) {
  console.error('❌ Failed to initialize Supabase for user management:', error.message);
  db = null;
}

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0, role, status } = req.query;

    // Get users from our AI-governed database
    const usersResult = await db.listUsers({
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: { role, status }
    });

    if (usersResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }

    const users = usersResult.data || [];

    console.log(`👥 Retrieved ${users.length} users`);

    res.json({
      success: true,
      data: users,
      count: users.length,
      message: 'Users retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users'
    });
  }
});

// GET /api/users/:id - Get specific user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get user from database
    const userResult = await db.getUser(id);

    if (userResult.error) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`👤 Retrieved user: ${id}`);

    res.json({
      success: true,
      data: userResult.data,
      message: 'User retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user'
    });
  }
});

// PUT /api/users/:id/role - Update user role
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Validate role
    const validRoles = ['admin', 'user', 'viewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be admin, user, or viewer'
      });
    }

    // Update user role
    const result = await db.updateUser(id, { role });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update user role'
      });
    }

    console.log(`👤 Updated user role: ${id} -> ${role}`);

    res.json({
      success: true,
      data: result.data,
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('❌ Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
});

// PUT /api/users/:id/status - Update user status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Validate status
    const validStatuses = ['active', 'inactive', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be active, inactive, or pending'
      });
    }

    // Update user status
    const result = await db.updateUser(id, { status });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update user status'
      });
    }

    console.log(`👤 Updated user status: ${id} -> ${status}`);

    res.json({
      success: true,
      data: result.data,
      message: 'User status updated successfully'
    });

  } catch (error) {
    console.error('❌ Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
});

// PUT /api/users/:id/profile - Update user profile
router.put('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, position, phone, location } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Update user profile
    const result = await db.updateUser(id, {
      name,
      email,
      department,
      position,
      phone,
      location
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update user profile'
      });
    }

    console.log(`👤 Updated user profile: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'User profile updated successfully'
    });

  } catch (error) {
    console.error('❌ Update user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Delete user
    const result = await db.deleteUser(id);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to delete user'
      });
    }

    console.log(`👤 Deleted user: ${id}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// GET /api/users/:id/permissions - Get user permissions
router.get('/:id/permissions', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get user permissions
    const userResult = await db.getUser(id);

    if (userResult.error) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const permissions = userResult.data.permissions || [];

    console.log(`🔐 Retrieved permissions for user: ${id}`);

    res.json({
      success: true,
      data: permissions,
      message: 'User permissions retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get user permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user permissions'
    });
  }
});

// PUT /api/users/:id/permissions - Update user permissions
router.put('/:id/permissions', async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Validate permissions
    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        error: 'Permissions must be an array'
      });
    }

    // Update user permissions
    const result = await db.updateUser(id, { permissions });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update user permissions'
      });
    }

    console.log(`🔐 Updated permissions for user: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'User permissions updated successfully'
    });

  } catch (error) {
    console.error('❌ Update user permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user permissions'
    });
  }
});

// GET /api/users/:id/activity - Get user activity
router.get('/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get user activity from audit logs
    const activityResult = await db.listAuditLogs({
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: { user_id: id }
    });

    if (activityResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user activity'
      });
    }

    const activity = activityResult.data || [];

    console.log(`📊 Retrieved activity for user: ${id}`);

    res.json({
      success: true,
      data: activity,
      count: activity.length,
      message: 'User activity retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get user activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user activity'
    });
  }
});

module.exports = router;
