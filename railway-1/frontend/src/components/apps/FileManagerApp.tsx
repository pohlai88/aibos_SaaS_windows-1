'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, File, FileText, Image, Video, Music, Archive,
  Search, Plus, Upload, Download, Trash2, Star, Share,
  MoreHorizontal, Grid, List, Eye, Edit, Copy, Scissors,
  ArrowLeft, ArrowRight, Home, HardDrive, Cloud, X
} from 'lucide-react';

// ==================== TYPES ====================

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  path: string;
  icon: string;
  isFavorite?: boolean;
  isShared?: boolean;
  metadata?: Record<string, any>;
}

export interface FileViewMode {
  type: 'grid' | 'list' | 'details';
  icon: React.ComponentType<any>;
}

// ==================== FILE MANAGER APP ====================

const FileManagerApp: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'details'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Home']);
  const [clipboard, setClipboard] = useState<{ action: 'copy' | 'cut'; files: string[] } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== MOCK DATA ====================

  const mockFiles: FileItem[] = [
    {
      id: '1',
      name: 'Documents',
      type: 'folder',
      modified: new Date('2024-01-15'),
      path: '/Documents',
      icon: 'folder'
    },
    {
      id: '2',
      name: 'Images',
      type: 'folder',
      modified: new Date('2024-01-14'),
      path: '/Images',
      icon: 'folder'
    },
    {
      id: '3',
      name: 'Project Notes.md',
      type: 'file',
      size: 2048,
      modified: new Date('2024-01-15T10:30:00'),
      path: '/Project Notes.md',
      icon: 'markdown',
      isFavorite: true
    },
    {
      id: '4',
      name: 'Meeting Agenda.docx',
      type: 'file',
      size: 15360,
      modified: new Date('2024-01-14T15:45:00'),
      path: '/Meeting Agenda.docx',
      icon: 'document'
    },
    {
      id: '5',
      name: 'Screenshot.png',
      type: 'file',
      size: 1024000,
      modified: new Date('2024-01-13T09:20:00'),
      path: '/Screenshot.png',
      icon: 'image'
    },
    {
      id: '6',
      name: 'Presentation.pptx',
      type: 'file',
      size: 5120000,
      modified: new Date('2024-01-12T14:15:00'),
      path: '/Presentation.pptx',
      icon: 'presentation'
    },
    {
      id: '7',
      name: 'Data Backup.zip',
      type: 'file',
      size: 10485760,
      modified: new Date('2024-01-11T11:30:00'),
      path: '/Data Backup.zip',
      icon: 'archive'
    }
  ];

  // ==================== FILE OPERATIONS ====================

  const loadFiles = useCallback(async (path: string) => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter files based on current path
    const filteredFiles = mockFiles.filter(file => {
      const filePath = file.path.split('/').slice(0, -1).join('/') || '/';
      return filePath === path;
    });

    setFiles(filteredFiles);
    setIsLoading(false);
  }, []);

  const navigateToPath = useCallback((path: string) => {
    setCurrentPath(path);
    setSelectedFiles([]);
    loadFiles(path);

    // Update breadcrumbs
    const pathParts = path.split('/').filter(Boolean);
    setBreadcrumbs(['Home', ...pathParts]);
  }, [loadFiles]);

  const goBack = useCallback(() => {
    if (currentPath !== '/') {
      const pathParts = currentPath.split('/').filter(Boolean);
      pathParts.pop();
      const newPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '/';
      navigateToPath(newPath);
    }
  }, [currentPath, navigateToPath]);

  const goForward = useCallback(() => {
    // Implementation for forward navigation
    console.log('Go forward');
  }, []);

  // ==================== FILE SELECTION ====================

  const handleFileSelect = useCallback((fileId: string, isMultiSelect: boolean = false) => {
    if (isMultiSelect) {
      setSelectedFiles(prev =>
        prev.includes(fileId)
          ? prev.filter(id => id !== fileId)
          : [...prev, fileId]
      );
    } else {
      setSelectedFiles([fileId]);
    }
  }, []);

  const handleFileDoubleClick = useCallback((file: FileItem) => {
    if (file.type === 'folder') {
      navigateToPath(file.path);
    } else {
      // Open file preview
      setPreviewFile(file);
      setShowPreview(true);
    }
  }, [navigateToPath]);

  // ==================== FILE OPERATIONS ====================

  const copyFiles = useCallback(() => {
    if (selectedFiles.length > 0) {
      setClipboard({ action: 'copy', files: selectedFiles });
    }
  }, [selectedFiles]);

  const cutFiles = useCallback(() => {
    if (selectedFiles.length > 0) {
      setClipboard({ action: 'cut', files: selectedFiles });
    }
  }, [selectedFiles]);

  const pasteFiles = useCallback(() => {
    if (clipboard) {
      console.log(`${clipboard.action} files:`, clipboard.files);
      setClipboard(null);
    }
  }, [clipboard]);

  const deleteFiles = useCallback(() => {
    if (selectedFiles.length > 0) {
      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    }
  }, [selectedFiles]);

  const toggleFavorite = useCallback((fileId: string) => {
    setFiles(prev => prev.map(file =>
      file.id === fileId
        ? { ...file, isFavorite: !file.isFavorite }
        : file
    ));
  }, []);

  // ==================== UPLOAD HANDLERS ====================

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      const newFiles: FileItem[] = Array.from(uploadedFiles).map((file, index) => ({
        id: `uploaded-${Date.now()}-${index}`,
        name: file.name,
        type: 'file' as const,
        size: file.size,
        modified: new Date(),
        path: `/${file.name}`,
        icon: getFileIcon(file.name)
      }));

      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'md': return 'markdown';
      case 'txt': return 'text';
      case 'doc':
      case 'docx': return 'document';
      case 'pdf': return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'image';
      case 'mp4':
      case 'avi':
      case 'mov': return 'video';
      case 'mp3':
      case 'wav': return 'music';
      case 'zip':
      case 'rar': return 'archive';
      default: return 'file';
    }
  };

  // ==================== SEARCH ====================

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  // ==================== RENDER HELPERS ====================

  const getFileIconComponent = (icon: string) => {
    switch (icon) {
      case 'folder': return <Folder size={20} className="text-blue-500" />;
      case 'markdown': return <FileText size={20} className="text-green-500" />;
      case 'document': return <FileText size={20} className="text-blue-500" />;
      case 'image': return <Image size={20} className="text-purple-500" />;
      case 'video': return <Video size={20} className="text-red-500" />;
      case 'music': return <Music size={20} className="text-pink-500" />;
      case 'archive': return <Archive size={20} className="text-orange-500" />;
      default: return <File size={20} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // ==================== RENDER ====================

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={goBack}
            disabled={currentPath === '/'}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={goForward}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigateToPath('/')}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Home size={16} />
          </button>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span>/</span>}
              <button
                onClick={() => {
                  const path = '/' + breadcrumbs.slice(1, index + 1).join('/');
                  navigateToPath(path);
                }}
                className="hover:text-blue-600 transition-colors"
              >
                {crumb}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Upload size={16} />
            <span>Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => setFiles(prev => [...prev, {
              id: `folder-${Date.now()}`,
              name: 'New Folder',
              type: 'folder',
              modified: new Date(),
              path: '/New Folder',
              icon: 'folder'
            }])}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus size={16} />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* File Operations */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center space-x-2 p-4 border-b border-gray-200 bg-blue-50">
          <span className="text-sm text-gray-600">
            {selectedFiles.length} item{selectedFiles.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={copyFiles}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Copy"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={cutFiles}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded"
              title="Cut"
            >
              <Scissors size={16} />
            </button>
            {clipboard && (
              <button
                onClick={pasteFiles}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                title="Paste"
              >
                <Download size={16} />
              </button>
            )}
            <button
              onClick={deleteFiles}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedFiles.includes(file.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleFileSelect(file.id)}
                onDoubleClick={() => handleFileDoubleClick(file)}
              >
                <div className="flex flex-col items-center space-y-2">
                  {getFileIconComponent(file.icon)}
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-800 truncate max-w-full">
                      {file.name}
                    </div>
                    {file.type === 'file' && (
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size || 0)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Favorite Star */}
                {file.isFavorite && (
                  <Star size={16} className="absolute top-2 right-2 text-yellow-500 fill-current" />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                  selectedFiles.includes(file.id)
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleFileSelect(file.id)}
                onDoubleClick={() => handleFileDoubleClick(file)}
              >
                {getFileIconComponent(file.icon)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800 truncate">
                      {file.name}
                    </span>
                    {file.isFavorite && (
                      <Star size={14} className="text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {file.type === 'file'
                      ? `${formatFileSize(file.size || 0)} • ${formatDate(file.modified)}`
                      : formatDate(file.modified)
                    }
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(file.id);
                  }}
                  className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  <Star size={16} className={file.isFavorite ? 'fill-current text-yellow-500' : ''} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {filteredFiles.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Folder size={48} className="mb-4 text-gray-300" />
            <p>No files found</p>
            <p className="text-sm">Upload files or create a new folder to get started</p>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      <AnimatePresence>
        {showPreview && previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {getFileIconComponent(previewFile.icon)}
                  <div>
                    <h3 className="font-medium text-gray-800">{previewFile.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(previewFile.size || 0)} • {formatDate(previewFile.modified)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="text-center text-gray-500">
                  <Eye size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>File preview not available</p>
                  <p className="text-sm">This file type cannot be previewed</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileManagerApp;
