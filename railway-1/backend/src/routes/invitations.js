const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for invitation routes');
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
  console.error('❌ Failed to initialize Supabase for invitations:', error.message);
  db = null;
}

// GET /api/invitations - Get all invitations
router.get('/', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0, status } = req.query;

    // Get invitations from database
    const invitationsResult = await db.listInvitations({
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: { status }
    });

    if (invitationsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch invitations'
      });
    }

    const invitations = invitationsResult.data || [];

    console.log(`📧 Retrieved ${invitations.length} invitations`);

    res.json({
      success: true,
      data: invitations,
      count: invitations.length,
      message: 'Invitations retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Invitations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve invitations'
    });
  }
});

// POST /api/invitations - Create new invitation
router.post('/', async (req, res) => {
  try {
    const { email, role, teamId, message } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Validate required fields
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email and role are required'
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

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser.data) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create invitation
    const invitation = {
      id: uuidv4(),
      email,
      role,
      teamId,
      status: 'pending',
      invitedBy: req.user?.id || 'system',
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      message
    };

    const result = await db.createInvitation(invitation);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create invitation'
      });
    }

    // TODO: Send invitation email
    console.log(`📧 Created invitation for: ${email}`);

    res.json({
      success: true,
      data: invitation,
      message: 'Invitation created successfully'
    });

  } catch (error) {
    console.error('❌ Create invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invitation'
    });
  }
});

// GET /api/invitations/:id - Get specific invitation
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get invitation from database
    const invitationResult = await db.getInvitation(id);

    if (invitationResult.error) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }

    console.log(`📧 Retrieved invitation: ${id}`);

    res.json({
      success: true,
      data: invitationResult.data,
      message: 'Invitation retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve invitation'
    });
  }
});

// PUT /api/invitations/:id - Update invitation
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role, message } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'accepted', 'expired', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    // Validate role
    const validRoles = ['admin', 'user', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    // Update invitation
    const result = await db.updateInvitation(id, {
      status,
      role,
      message
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update invitation'
      });
    }

    console.log(`📧 Updated invitation: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Invitation updated successfully'
    });

  } catch (error) {
    console.error('❌ Update invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update invitation'
    });
  }
});

// DELETE /api/invitations/:id - Cancel invitation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Cancel invitation
    const result = await db.updateInvitation(id, { status: 'cancelled' });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to cancel invitation'
      });
    }

    console.log(`📧 Cancelled invitation: ${id}`);

    res.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Cancel invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel invitation'
    });
  }
});

// POST /api/invitations/:id/resend - Resend invitation
router.post('/:id/resend', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get invitation
    const invitationResult = await db.getInvitation(id);
    if (invitationResult.error) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }

    const invitation = invitationResult.data;

    // Check if invitation is still valid
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Invitation is not pending'
      });
    }

    // Extend expiration date
    const result = await db.updateInvitation(id, {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      resentAt: new Date()
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to resend invitation'
      });
    }

    // TODO: Send invitation email
    console.log(`📧 Resent invitation: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Invitation resent successfully'
    });

  } catch (error) {
    console.error('❌ Resend invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend invitation'
    });
  }
});

// POST /api/invitations/:id/accept - Accept invitation
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, password } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get invitation
    const invitationResult = await db.getInvitation(id);
    if (invitationResult.error) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found'
      });
    }

    const invitation = invitationResult.data;

    // Check if invitation is valid
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Invitation is not pending'
      });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({
        success: false,
        error: 'Invitation has expired'
      });
    }

    // Create user
    const user = {
      id: uuidv4(),
      email: invitation.email,
      name,
      role: invitation.role,
      status: 'active',
      tenantId: invitation.teamId || req.user?.tenant_id,
      createdAt: new Date()
    };

    const userResult = await db.createUser(user);
    if (userResult.error) {
      return res.status(400).json({
        success: false,
        error: userResult.error || 'Failed to create user'
      });
    }

    // Update invitation status
    await db.updateInvitation(id, { status: 'accepted' });

    console.log(`📧 Accepted invitation: ${id}`);

    res.json({
      success: true,
      data: userResult.data,
      message: 'Invitation accepted successfully'
    });

  } catch (error) {
    console.error('❌ Accept invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept invitation'
    });
  }
});

module.exports = router;
