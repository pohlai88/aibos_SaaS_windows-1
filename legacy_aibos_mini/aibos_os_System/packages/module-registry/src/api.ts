/**
 * AI-BOS Module Registry API
 * 
 * REST API endpoints for module submission, management, and discovery
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { moduleRegistry, ModuleMetadata, ModuleStatus } from './index';

// File upload handling
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for file storage
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only ZIP and TAR files
    if (file.mimetype === 'application/zip' || 
        file.mimetype === 'application/x-zip-compressed' ||
        file.mimetype === 'application/x-tar' ||
        file.mimetype === 'application/gzip') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only ZIP and TAR files are allowed.'));
    }
  }
});

// Developer authentication middleware
const authenticateDeveloper = async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    // Verify API key with Supabase
    const { data: developer, error } = await supabase
      .from('developers')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error || !developer) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.developer = developer;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// API Routes

/**
 * POST /api/developer/modules/submit
 * Submit a new module for review
 */
export async function submitModule(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Handle file upload
    upload.array('files', 5)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const files = req.files as Express.Multer.File[];
      const metadata = JSON.parse(req.body.metadata);

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Upload files to Supabase Storage
      const uploadedFiles = [];
      for (const file of files) {
        const fileName = `${metadata.id}_${Date.now()}_${file.originalname}`;
        const filePath = `modules/${req.developer.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('module-files')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600'
          });

        if (error) {
          return res.status(500).json({ error: 'File upload failed' });
        }

        uploadedFiles.push({
          originalName: file.originalname,
          path: filePath,
          size: file.size
        });
      }

      // Create module metadata
      const moduleMetadata: ModuleMetadata = {
        ...metadata,
        author: req.developer.id,
        status: ModuleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        downloads: 0,
        rating: 0,
        files: uploadedFiles
      };

      // Register module
      await moduleRegistry.registerModule(moduleMetadata);

      // Create review record
      await supabase
        .from('module_reviews')
        .insert({
          module_id: metadata.id,
          developer_id: req.developer.id,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          files: uploadedFiles
        });

      res.status(201).json({
        success: true,
        message: 'Module submitted for review',
        moduleId: metadata.id
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Module submission failed' });
  }
}

/**
 * GET /api/developer/modules
 * List developer's modules
 */
export async function listDeveloperModules(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: modules, error } = await supabase
      .from('modules')
      .select('*')
      .eq('author', req.developer.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch modules' });
    }

    res.status(200).json({ modules });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list modules' });
  }
}

/**
 * PUT /api/developer/modules/:id
 * Update module
 */
export async function updateModule(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const updates = req.body;

    // Verify ownership
    const { data: module, error: fetchError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .eq('author', req.developer.id)
      .single();

    if (fetchError || !module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Update module
    const { data, error } = await supabase
      .from('modules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update module' });
    }

    res.status(200).json({ module: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update module' });
  }
}

/**
 * GET /api/developer/revenue
 * Get developer revenue
 */
export async function getDeveloperRevenue(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: revenue, error } = await supabase
      .from('module_revenue')
      .select('*')
      .eq('developer_id', req.developer.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch revenue' });
    }

    const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);

    res.status(200).json({
      revenue,
      totalRevenue,
      moduleCount: revenue.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
}

/**
 * GET /api/modules
 * Public module discovery
 */
export async function discoverModules(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('modules')
      .select('*')
      .eq('status', 'published');

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: modules, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('downloads', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch modules' });
    }

    res.status(200).json({
      modules,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to discover modules' });
  }
}

/**
 * POST /api/modules/:id/install
 * Install a module
 */
export async function installModule(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { organizationId } = req.body;

    // Get module details
    const { data: module, error: fetchError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (fetchError || !module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Install module
    const installation = await moduleRegistry.installModule(
      id as string,
      module.version,
      { organizationId }
    );

    // Record installation
    await supabase
      .from('module_installations')
      .insert({
        module_id: id,
        organization_id: organizationId,
        installed_at: new Date().toISOString(),
        version: module.version
      });

    // Update download count
    await supabase
      .from('modules')
      .update({ downloads: module.downloads + 1 })
      .eq('id', id);

    res.status(200).json({
      success: true,
      installation
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to install module' });
  }
}

// Export all API handlers
export const moduleApiHandlers = {
  submitModule,
  listDeveloperModules,
  updateModule,
  getDeveloperRevenue,
  discoverModules,
  installModule
}; 