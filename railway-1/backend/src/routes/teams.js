const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for team routes');
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
  console.error('❌ Failed to initialize Supabase for teams:', error.message);
  db = null;
}

// ==================== TEAM MANAGEMENT ====================

// GET /api/teams - Get all teams
router.get('/', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get teams from database
    const teamsResult = await db.getTeams({
      userId: req.user?.id
    });

    if (teamsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch teams'
      });
    }

    // Generate mock teams data if none exists
    const teamsData = teamsResult.data || [
      {
        id: uuidv4(),
        name: 'Development Team',
        description: 'Core development team for AI-BOS platform',
        ownerId: req.user?.id || 'user-1',
        ownerName: 'John Doe',
        memberCount: 8,
        createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'Design Team',
        description: 'UI/UX design and user experience team',
        ownerId: req.user?.id || 'user-1',
        ownerName: 'Jane Smith',
        memberCount: 5,
        createdAt: new Date(Date.now() - 86400000 * 15), // 15 days ago
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'Marketing Team',
        description: 'Marketing and growth team',
        ownerId: req.user?.id || 'user-1',
        ownerName: 'Mike Johnson',
        memberCount: 6,
        createdAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
        status: 'active'
      }
    ];

    console.log(`👥 Retrieved ${teamsData.length} teams`);

    res.json({
      success: true,
      data: teamsData,
      count: teamsData.length,
      message: 'Teams retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Teams error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve teams'
    });
  }
});

// POST /api/teams - Create new team
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Team name and description are required'
      });
    }

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Create team in database
    const newTeam = {
      id: uuidv4(),
      name,
      description,
      ownerId: req.user?.id || 'user-1',
      ownerName: req.user?.name || 'Current User',
      memberCount: 1,
      createdAt: new Date(),
      status: 'active'
    };

    const result = await db.createTeam(newTeam);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create team'
      });
    }

    console.log(`✅ Created team: ${name}`);

    res.status(201).json({
      success: true,
      data: newTeam,
      message: 'Team created successfully'
    });

  } catch (error) {
    console.error('❌ Create team error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create team'
    });
  }
});

// GET /api/teams/:id - Get specific team
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get team from database
    const teamResult = await db.getTeam(id, {
      userId: req.user?.id
    });

    if (teamResult.error) {
      return res.status(404).json({
        success: false,
        error: 'Team not found'
      });
    }

    console.log(`👥 Retrieved team: ${id}`);

    res.json({
      success: true,
      data: teamResult.data,
      message: 'Team retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get team error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve team'
    });
  }
});

// PUT /api/teams/:id - Update team
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Update team in database
    const result = await db.updateTeam(id, {
      name,
      description,
      status,
      updatedBy: req.user?.id
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update team'
      });
    }

    console.log(`✅ Updated team: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Team updated successfully'
    });

  } catch (error) {
    console.error('❌ Update team error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update team'
    });
  }
});

// DELETE /api/teams/:id - Delete team
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Delete team from database
    const result = await db.deleteTeam(id, {
      deletedBy: req.user?.id
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to delete team'
      });
    }

    console.log(`🗑️ Deleted team: ${id}`);

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete team error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete team'
    });
  }
});

// ==================== TEAM MEMBERS ====================

// GET /api/teams/members - Get all team members
router.get('/members', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get team members from database
    const membersResult = await db.getTeamMembers({
      userId: req.user?.id
    });

    if (membersResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch team members'
      });
    }

    // Generate mock members data if none exists
    const membersData = membersResult.data || [
      {
        id: uuidv4(),
        userId: 'user-1',
        teamId: 'team-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'owner',
        status: 'active',
        joinedAt: new Date(Date.now() - 86400000 * 30),
        lastActive: new Date()
      },
      {
        id: uuidv4(),
        userId: 'user-2',
        teamId: 'team-1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        status: 'active',
        joinedAt: new Date(Date.now() - 86400000 * 25),
        lastActive: new Date()
      },
      {
        id: uuidv4(),
        userId: 'user-3',
        teamId: 'team-1',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'member',
        status: 'active',
        joinedAt: new Date(Date.now() - 86400000 * 20),
        lastActive: new Date()
      }
    ];

    console.log(`👤 Retrieved ${membersData.length} team members`);

    res.json({
      success: true,
      data: membersData,
      count: membersData.length,
      message: 'Team members retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Team members error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve team members'
    });
  }
});

// POST /api/teams/members - Add member to team
router.post('/members', async (req, res) => {
  try {
    const { teamId, userId, role } = req.body;

    if (!teamId || !userId || !role) {
      return res.status(400).json({
        success: false,
        error: 'Team ID, user ID, and role are required'
      });
    }

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Add member to team in database
    const newMember = {
      id: uuidv4(),
      teamId,
      userId,
      role,
      status: 'active',
      joinedAt: new Date(),
      lastActive: new Date()
    };

    const result = await db.addTeamMember(newMember);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to add team member'
      });
    }

    console.log(`✅ Added member to team: ${teamId}`);

    res.status(201).json({
      success: true,
      data: newMember,
      message: 'Team member added successfully'
    });

  } catch (error) {
    console.error('❌ Add team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add team member'
    });
  }
});

// PATCH /api/teams/members/:id - Update team member
router.patch('/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Update team member in database
    const result = await db.updateTeamMember(id, {
      role,
      status,
      updatedBy: req.user?.id
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update team member'
      });
    }

    console.log(`✅ Updated team member: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Team member updated successfully'
    });

  } catch (error) {
    console.error('❌ Update team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update team member'
    });
  }
});

// DELETE /api/teams/members/:id - Remove team member
router.delete('/members/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Remove team member from database
    const result = await db.removeTeamMember(id, {
      removedBy: req.user?.id
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to remove team member'
      });
    }

    console.log(`🗑️ Removed team member: ${id}`);

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });

  } catch (error) {
    console.error('❌ Remove team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove team member'
    });
  }
});

// ==================== TEAM INVITATIONS ====================

// GET /api/teams/invitations - Get all invitations
router.get('/invitations', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get invitations from database
    const invitationsResult = await db.getTeamInvitations({
      userId: req.user?.id
    });

    if (invitationsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch invitations'
      });
    }

    // Generate mock invitations data if none exists
    const invitationsData = invitationsResult.data || [
      {
        id: uuidv4(),
        teamId: 'team-1',
        email: 'newuser@example.com',
        role: 'member',
        invitedBy: 'John Doe',
        invitedAt: new Date(Date.now() - 86400000 * 2),
        expiresAt: new Date(Date.now() + 86400000 * 5),
        status: 'pending'
      },
      {
        id: uuidv4(),
        teamId: 'team-2',
        email: 'designer@example.com',
        role: 'admin',
        invitedBy: 'Jane Smith',
        invitedAt: new Date(Date.now() - 86400000 * 1),
        expiresAt: new Date(Date.now() + 86400000 * 5),
        status: 'pending'
      }
    ];

    console.log(`📧 Retrieved ${invitationsData.length} invitations`);

    res.json({
      success: true,
      data: invitationsData,
      count: invitationsData.length,
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

// POST /api/teams/invitations - Send invitation
router.post('/invitations', async (req, res) => {
  try {
    const { teamId, email, role } = req.body;

    if (!teamId || !email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Team ID, email, and role are required'
      });
    }

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Create invitation in database
    const newInvitation = {
      id: uuidv4(),
      teamId,
      email,
      role,
      invitedBy: req.user?.name || 'Current User',
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000 * 7), // 7 days
      status: 'pending'
    };

    const result = await db.createTeamInvitation(newInvitation);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create invitation'
      });
    }

    console.log(`📧 Sent invitation to: ${email}`);

    res.status(201).json({
      success: true,
      data: newInvitation,
      message: 'Invitation sent successfully'
    });

  } catch (error) {
    console.error('❌ Send invitation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send invitation'
    });
  }
});

// DELETE /api/teams/invitations/:id - Cancel invitation
router.delete('/invitations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Cancel invitation in database
    const result = await db.cancelTeamInvitation(id, {
      cancelledBy: req.user?.id
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to cancel invitation'
      });
    }

    console.log(`❌ Cancelled invitation: ${id}`);

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

// ==================== TEAM ACTIVITY ====================

// GET /api/teams/activity - Get team activity
router.get('/activity', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0, teamId } = req.query;

    // Get team activity from database
    const activityResult = await db.getTeamActivity({
      limit: parseInt(limit),
      offset: parseInt(offset),
      teamId,
      userId: req.user?.id
    });

    if (activityResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch team activity'
      });
    }

    const activityData = activityResult.data || [];

    console.log(`📊 Retrieved ${activityData.length} activity records`);

    res.json({
      success: true,
      data: activityData,
      count: activityData.length,
      message: 'Team activity retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Team activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve team activity'
    });
  }
});

module.exports = router;
