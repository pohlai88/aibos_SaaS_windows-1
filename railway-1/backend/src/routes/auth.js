const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database connection with error handling
let db;
try {
  const supabaseModule = require('../utils/supabase');
  db = supabaseModule.db;
  console.log('✅ Supabase connection initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Supabase:', error.message);
  db = null;
}

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Demo user logic - 1 secret default + 1 public demo
    const demoUsers = [
      { email: 'jackwee@ai-bos.io', password: 'Weepohlai88!', name: 'Default Admin' }, // Secret default
      { email: 'admin@demo.com', password: 'Demo123!', name: 'Demo Admin' } // Public demo
    ];

    const demoUser = demoUsers.find(user => user.email === email && user.password === password);

    if (demoUser) {
      console.log(`🔐 Demo user login attempt: ${email}`);

      if (!db) {
        console.error('❌ Database not available for demo user creation');
        return res.status(500).json({
          success: false,
          error: 'Database service unavailable. Please try again later.'
        });
      }

      try {
        // Try to get user
        let userResult = await db.getUserByEmail(email);
        let user = userResult.data;
        let tenant;

        if (!user) {
          console.log(`📝 Creating new demo user: ${email}`);
          // Create tenant
          const tenantData = {
            tenant_id: uuidv4(),
            name: 'Demo Tenant',
            status: 'active',
            settings: {}
          };
          const tenantResult = await db.createTenant(tenantData);
          if (tenantResult.error) {
            console.error('❌ Failed to create tenant:', tenantResult.error);
            return res.status(500).json({ success: false, error: 'Failed to create tenant' });
          }
          tenant = tenantResult.data;

          // Hash password
          const passwordHash = await bcrypt.hash(password, 10);

          // Create user
          const userData = {
            user_id: uuidv4(),
            tenant_id: tenant.tenant_id,
            email,
            name: demoUser.name,
            role: 'admin',
            permissions: ['read', 'write', 'admin'],
            password_hash: passwordHash
          };
          const userCreateResult = await db.createUser(userData);
          if (userCreateResult.error) {
            console.error('❌ Failed to create user:', userCreateResult.error);
            return res.status(500).json({ success: false, error: 'Failed to create user' });
          }
          user = userCreateResult.data;
          console.log(`✅ Demo user created successfully: ${email}`);
        } else {
          console.log(`👤 Existing demo user found: ${email}`);
          // Get tenant
          const tenantResult = await db.getTenant(user.tenant_id);
          if (!tenantResult.data) {
            console.error('❌ Tenant not found for user:', user.user_id);
            return res.status(401).json({ success: false, error: 'Tenant not found' });
          }
          tenant = tenantResult.data;
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            user_id: user.user_id,
            tenant_id: user.tenant_id,
            email: user.email,
            role: user.role
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        console.log(`✅ Demo user login successful: ${email}`);
        return res.json({
          success: true,
          data: {
            token,
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
          message: 'Login successful (demo user)'
        });
      } catch (dbError) {
        console.error('❌ Database error during demo user login:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Database service error. Please try again later.'
        });
      }
    }

    // Regular user login (non-demo)
    if (!db) {
      console.error('❌ Database not available for regular user login');
      return res.status(500).json({
        success: false,
        error: 'Database service unavailable. Please try again later.'
      });
    }

    console.log(`🔐 Regular user login attempt: ${email}`);

    // Get user from database
    const userResult = await db.getUserByEmail(email);
    if (!userResult.data) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = userResult.data;
    const tenantResult = await db.getTenant(user.tenant_id);
    if (!tenantResult.data) {
      console.error('❌ Tenant not found for user:', user.user_id);
      return res.status(401).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const tenant = tenantResult.data;

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      console.log(`❌ Invalid password for user: ${email}`);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        tenant_id: user.tenant_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Regular user login successful: ${email}`);
    res.json({
      success: true,
      data: {
        token,
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
      message: 'Login successful'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, tenant_name } = req.body;

    if (!email || !password || !name || !tenant_name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, name, and tenant_name are required'
      });
    }

    // Check if user already exists
    const existingUserResult = await db.getUserByEmail(email);
    if (existingUserResult.data) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create tenant
    const tenantData = {
      tenant_id: uuidv4(),
      name: tenant_name,
      status: 'active',
      settings: {}
    };

    const tenantResult = await db.createTenant(tenantData);
    if (tenantResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create tenant'
      });
    }

    const tenant = tenantResult.data;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userData = {
      user_id: uuidv4(),
      tenant_id: tenant.tenant_id,
      email,
      name,
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
      password_hash: passwordHash
    };

    const userResult = await db.createUser(userData);
    if (userResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }

    const user = userResult.data;

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        tenant_id: user.tenant_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
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
      message: 'Registration successful'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await db.getUserById(decoded.user_id);
    if (!userResult.data) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    const user = userResult.data;
    const tenantResult = await db.getTenant(user.tenant_id);
    if (!tenantResult.data) {
      return res.status(401).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const tenant = tenantResult.data;

    res.json({
      success: true,
      data: {
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
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/tenants - List tenants (admin only)
router.get('/tenants', async (req, res) => {
  try {
    const tenantsResult = await db.listTenants();
    if (tenantsResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch tenants'
      });
    }

    res.json({
      success: true,
      data: {
        tenants: tenantsResult.data,
        count: tenantsResult.data.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/users - List users in tenant
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenant_id = decoded.tenant_id;

    // Get all users and filter by tenant
    const usersResult = await db.listUsers();
    if (usersResult.error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }

    const filteredUsers = usersResult.data.filter(u => u.tenant_id === tenant_id);
    const safeUsers = filteredUsers.map(user => ({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at
    }));

    res.json({
      success: true,
      data: {
        users: safeUsers,
        count: safeUsers.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/test - Test database connection and create demo user
router.get('/test', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not available'
      });
    }

    console.log('🔍 Testing database connection...');

    // Try to create a test tenant
    const tenantData = {
      tenant_id: uuidv4(),
      name: 'Test Demo Tenant',
      status: 'active',
      settings: {}
    };

    const tenantResult = await db.createTenant(tenantData);
    if (tenantResult.error) {
      console.error('❌ Failed to create tenant:', tenantResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create tenant: ' + tenantResult.error.message
      });
    }

    console.log('✅ Tenant created successfully');

    // Try to create demo user
    const passwordHash = await bcrypt.hash('Demo123!', 10);
    const userData = {
      user_id: uuidv4(),
      tenant_id: tenantResult.data.tenant_id,
      email: 'admin@demo.com',
      name: 'Demo Admin',
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
      password_hash: passwordHash
    };

    const userResult = await db.createUser(userData);
    if (userResult.error) {
      console.error('❌ Failed to create user:', userResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user: ' + userResult.error.message
      });
    }

    console.log('✅ Demo user created successfully');

    res.json({
      success: true,
      message: 'Database test successful - demo user created',
      data: {
        tenant: tenantResult.data,
        user: userResult.data
      }
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
