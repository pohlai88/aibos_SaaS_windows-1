/**
 * Upload Routes
 * Handle file uploads for modules and other assets
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const { Logger } = require('../../../utils/logger');
const { ConfigManager } = require('../../../utils/config-manager');

const router = express.Router();
const logger = new Logger('Upload-Routes');
const config = new ConfigManager();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../storage/uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types for modules
  const allowedTypes = [
    '.js', '.ts', '.json', '.zip', '.tar.gz', '.tgz',
    'application/javascript',
    'application/json',
    'application/zip',
    'application/x-tar',
    'application/gzip'
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isAllowedType = allowedTypes.includes(fileExtension) || 
                       allowedTypes.includes(file.mimetype);

  if (isAllowedType) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.originalname}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Max 10 files per request
  }
});

// Upload single module file
router.post('/module', upload.single('module'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    const fileInfo = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    logger.info(`📁 Module uploaded: ${fileInfo.originalName}`, fileInfo);

    res.json({
      success: true,
      message: 'Module uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    logger.error('❌ Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Upload multiple module files
router.post('/modules', upload.array('modules', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select files to upload'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    }));

    logger.info(`📁 Multiple modules uploaded: ${uploadedFiles.length} files`);

    res.json({
      success: true,
      message: `${uploadedFiles.length} modules uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    logger.error('❌ Multiple upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Upload with drag & drop (handles FormData)
router.post('/drag-drop', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please drop a file to upload'
      });
    }

    const fileInfo = {
      id: uuidv4(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
      uploadMethod: 'drag-drop'
    };

    logger.info(`📁 Drag & drop upload: ${fileInfo.originalName}`);

    res.json({
      success: true,
      message: 'File uploaded successfully via drag & drop',
      file: fileInfo
    });

  } catch (error) {
    logger.error('❌ Drag & drop upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Get upload progress (for large files)
router.get('/progress/:uploadId', (req, res) => {
  const { uploadId } = req.params;
  
  // In a real implementation, you'd track progress in memory or Redis
  res.json({
    uploadId,
    progress: 100,
    status: 'completed'
  });
});

// Delete uploaded file
router.delete('/file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        error: 'Filename required',
        message: 'Please provide the filename to delete'
      });
    }

    const filePath = path.join(__dirname, '../../../storage/uploads', filename);
    
    try {
      await fs.unlink(filePath);
      logger.info(`🗑️ File deleted: ${filename}`);
      
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).json({
          error: 'File not found',
          message: 'The specified file does not exist'
        });
      } else {
        throw error;
      }
    }

  } catch (error) {
    logger.error('❌ File deletion error:', error);
    res.status(500).json({
      error: 'Deletion failed',
      message: error.message
    });
  }
});

// Get upload statistics
router.get('/stats', async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../../../storage/uploads');
    
    try {
      const files = await fs.readdir(uploadDir);
      const stats = await Promise.all(
        files.map(async (filename) => {
          const filePath = path.join(uploadDir, filename);
          const stat = await fs.stat(filePath);
          return {
            filename,
            size: stat.size,
            uploadedAt: stat.birthtime
          };
        })
      );

      const totalSize = stats.reduce((sum, file) => sum + file.size, 0);
      const totalFiles = stats.length;

      res.json({
        totalFiles,
        totalSize,
        averageSize: totalFiles > 0 ? totalSize / totalFiles : 0,
        files: stats
      });

    } catch (error) {
      if (error.code === 'ENOENT') {
        res.json({
          totalFiles: 0,
          totalSize: 0,
          averageSize: 0,
          files: []
        });
      } else {
        throw error;
      }
    }

  } catch (error) {
    logger.error('❌ Stats error:', error);
    res.status(500).json({
      error: 'Failed to get upload statistics',
      message: error.message
    });
  }
});

module.exports = router; 