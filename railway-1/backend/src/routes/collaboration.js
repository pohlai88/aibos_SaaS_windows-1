const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// ==================== MANIFESTOR INTEGRATION ====================
const { requirePermission, requireModule, withModuleConfig, validateRequest, rateLimitFromManifest } = require('../middleware/manifestor-auth.js');

// Import our AI-governed database system
let aiDatabaseSystem;
try {
  const { getAIDatabaseSystem } = require('../ai-database');
  aiDatabaseSystem = getAIDatabaseSystem();
  console.log('✅ AI Database System initialized for collaboration routes');
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
  console.error('❌ Failed to initialize Supabase for collaboration:', error.message);
  db = null;
}

// ==================== THREADS ====================

// GET /api/collaboration/threads - Get all threads
router.get('/threads',
  requireModule('collaboration'),
  withModuleConfig('collaboration'),
  requirePermission('collaboration', 'view'),
  rateLimitFromManifest('collaboration', '/collaboration/threads'),
  validateRequest([]),
  async (req, res) => {
  try {
    // Get manifest-driven configuration
    const moduleConfig = req.moduleConfig;
    const features = moduleConfig.features;
    const security = moduleConfig.security;
    const performance = moduleConfig.performance;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0 } = req.query;

    // Get threads from database
    const threadsResult = await db.listThreads({
      limit: parseInt(limit),
      offset: parseInt(offset),
      userId: req.user?.id
    });

    if (threadsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch threads'
      });
    }

    const threads = threadsResult.data || [];

    console.log(`💬 Retrieved ${threads.length} threads`);

    // Manifest-driven audit logging
    if (security?.audit_logging) {
      console.log('Collaboration audit: Threads retrieved', {
        userId: req.user?.id,
        count: threads.length,
        timestamp: new Date(),
        ip: req.ip
      });
    }

    res.json({
      success: true,
      data: threads,
      count: threads.length,
      message: 'Threads retrieved successfully',
      config: {
        features: Object.keys(features || {}).filter(key => features[key]),
        security: Object.keys(security || {}).filter(key => security[key])
      },
      manifest: {
        id: 'collaboration',
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('❌ Threads error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve threads'
    });
  }
});

// POST /api/collaboration/threads - Create new thread
router.post('/threads', async (req, res) => {
  try {
    const { title, participants } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Thread title is required'
      });
    }

    // Create thread
    const thread = {
      id: uuidv4(),
      title,
      participants: [...(participants || []), req.user?.id].filter(Boolean),
      messages: [],
      lastActivity: new Date(),
      unreadCount: 0,
      createdBy: req.user?.id,
      createdAt: new Date()
    };

    const result = await db.createThread(thread);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create thread'
      });
    }

    console.log(`💬 Created thread: ${title}`);

    res.json({
      success: true,
      data: thread,
      message: 'Thread created successfully'
    });

  } catch (error) {
    console.error('❌ Create thread error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create thread'
    });
  }
});

// GET /api/collaboration/threads/:id - Get specific thread
router.get('/threads/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get thread from database
    const threadResult = await db.getThread(id);

    if (threadResult.error) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    console.log(`💬 Retrieved thread: ${id}`);

    res.json({
      success: true,
      data: threadResult.data,
      message: 'Thread retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get thread error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve thread'
    });
  }
});

// ==================== MESSAGES ====================

// GET /api/collaboration/messages - Get messages for a thread
router.get('/messages', async (req, res) => {
  try {
    const { threadId, limit = 50, offset = 0 } = req.query;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    if (!threadId) {
      return res.status(400).json({
        success: false,
        error: 'Thread ID is required'
      });
    }

    // Get messages from database
    const messagesResult = await db.listMessages({
      threadId,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    if (messagesResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch messages'
      });
    }

    const messages = messagesResult.data || [];

    console.log(`💬 Retrieved ${messages.length} messages for thread: ${threadId}`);

    res.json({
      success: true,
      data: messages,
      count: messages.length,
      message: 'Messages retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve messages'
    });
  }
});

// POST /api/collaboration/messages - Send message
router.post('/messages', async (req, res) => {
  try {
    const { threadId, content, type = 'text' } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Validate required fields
    if (!threadId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Thread ID and content are required'
      });
    }

    // Create message
    const message = {
      id: uuidv4(),
      threadId,
      content,
      type,
      sender: {
        id: req.user?.id,
        name: req.user?.name || 'Unknown User'
      },
      timestamp: new Date(),
      status: 'sent',
      reactions: []
    };

    const result = await db.createMessage(message);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to send message'
      });
    }

    // Update thread last activity
    await db.updateThread(threadId, {
      lastActivity: new Date(),
      unreadCount: 0
    });

    console.log(`💬 Sent message in thread: ${threadId}`);

    res.json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
});

// PUT /api/collaboration/messages/:id - Update message
router.put('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    // Update message
    const result = await db.updateMessage(id, { content });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update message'
      });
    }

    console.log(`💬 Updated message: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Message updated successfully'
    });

  } catch (error) {
    console.error('❌ Update message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update message'
    });
  }
});

// DELETE /api/collaboration/messages/:id - Delete message
router.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Delete message
    const result = await db.deleteMessage(id);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to delete message'
      });
    }

    console.log(`💬 Deleted message: ${id}`);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    });
  }
});

// ==================== DOCUMENTS ====================

// GET /api/collaboration/documents - Get all documents
router.get('/documents', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0, type } = req.query;

    // Get documents from database
    const documentsResult = await db.listDocuments({
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: { type },
      userId: req.user?.id
    });

    if (documentsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch documents'
      });
    }

    const documents = documentsResult.data || [];

    console.log(`📄 Retrieved ${documents.length} documents`);

    res.json({
      success: true,
      data: documents,
      count: documents.length,
      message: 'Documents retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve documents'
    });
  }
});

// POST /api/collaboration/documents - Create new document
router.post('/documents', async (req, res) => {
  try {
    const { title, type = 'document', content = '' } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Document title is required'
      });
    }

    // Create document
    const document = {
      id: uuidv4(),
      title,
      type,
      content,
      collaborators: [req.user?.id].filter(Boolean),
      lastModified: new Date(),
      version: 1,
      status: 'draft',
      createdBy: req.user?.id,
      createdAt: new Date()
    };

    const result = await db.createDocument(document);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create document'
      });
    }

    console.log(`📄 Created document: ${title}`);

    res.json({
      success: true,
      data: document,
      message: 'Document created successfully'
    });

  } catch (error) {
    console.error('❌ Create document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create document'
    });
  }
});

// GET /api/collaboration/documents/:id - Get specific document
router.get('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Get document from database
    const documentResult = await db.getDocument(id);

    if (documentResult.error) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    console.log(`📄 Retrieved document: ${id}`);

    res.json({
      success: true,
      data: documentResult.data,
      message: 'Document retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Get document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve document'
    });
  }
});

// PUT /api/collaboration/documents/:id - Update document
router.put('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Update document
    const result = await db.updateDocument(id, {
      title,
      content,
      status,
      lastModified: new Date(),
      version: { increment: 1 }
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to update document'
      });
    }

    console.log(`📄 Updated document: ${id}`);

    res.json({
      success: true,
      data: result.data,
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('❌ Update document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document'
    });
  }
});

// ==================== WORKSPACES ====================

// GET /api/collaboration/workspaces - Get all workspaces
router.get('/workspaces', async (req, res) => {
  try {
    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    const { limit = 50, offset = 0 } = req.query;

    // Get workspaces from database
    const workspacesResult = await db.listWorkspaces({
      limit: parseInt(limit),
      offset: parseInt(offset),
      userId: req.user?.id
    });

    if (workspacesResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch workspaces'
      });
    }

    const workspaces = workspacesResult.data || [];

    console.log(`🏢 Retrieved ${workspaces.length} workspaces`);

    res.json({
      success: true,
      data: workspaces,
      count: workspaces.length,
      message: 'Workspaces retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Workspaces error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve workspaces'
    });
  }
});

// POST /api/collaboration/workspaces - Create new workspace
router.post('/workspaces', async (req, res) => {
  try {
    const { name, description, settings } = req.body;

    if (!aiDatabaseSystem || !db) {
      return res.status(500).json({
        success: false,
        error: 'AI Database System or Database service unavailable'
      });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Workspace name is required'
      });
    }

    // Create workspace
    const workspace = {
      id: uuidv4(),
      name,
      description,
      members: [req.user?.id].filter(Boolean),
      documents: [],
      threads: [],
      settings: {
        allowGuestAccess: false,
        requireApproval: false,
        maxMembers: 100,
        ...settings
      },
      createdBy: req.user?.id,
      createdAt: new Date()
    };

    const result = await db.createWorkspace(workspace);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create workspace'
      });
    }

    console.log(`🏢 Created workspace: ${name}`);

    res.json({
      success: true,
      data: workspace,
      message: 'Workspace created successfully'
    });

  } catch (error) {
    console.error('❌ Create workspace error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create workspace'
    });
  }
});

module.exports = router;
