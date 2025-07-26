'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  FolderOpen, FileText, Image, Video, Music, Archive,
  Search, Grid, List, Plus, Trash2, Download, Share2,
  Eye, Edit, Star, Clock, User, Tag
} from 'lucide-react';
import { useConsciousness } from '../consciousness/ConsciousnessEngine';

// ==================== TYPES ====================

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code';
  size: number;
  modified: Date;
  created: Date;
  tags: string[];
  favorite: boolean;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  content?: string;
  metadata?: any;
}

interface Folder {
  id: string;
  name: string;
  path: string;
  items: FileItem[];
  position: { x: number; y: number; z: number };
  isOpen: boolean;
}

interface SpatialView {
  type: 'grid' | 'stack' | 'orbit' | 'timeline';
  camera: { x: number; y: number; z: number };
  zoom: number;
}

// ==================== REAL FILE SYSTEM MANAGER ====================

class SpatialFileSystem {
  private files: Map<string, FileItem> = new Map();
  private folders: Map<string, Folder> = new Map();
  private currentView: SpatialView = {
    type: 'grid',
    camera: { x: 0, y: 0, z: 1000 },
    zoom: 1
  };

  constructor() {
    this.initializeFileSystem();
  }

  private initializeFileSystem() {
    // Create root folders
    const rootFolders = [
      { name: 'Documents', path: '/documents' },
      { name: 'Images', path: '/images' },
      { name: 'Videos', path: '/videos' },
      { name: 'Music', path: '/music' },
      { name: 'Projects', path: '/projects' },
      { name: 'AI-BOS', path: '/ai-bos' }
    ];

    rootFolders.forEach((folder, index) => {
      const folderItem: Folder = {
        id: folder.path,
        name: folder.name,
        path: folder.path,
        items: [],
        position: { x: (index - 2.5) * 200, y: 0, z: 0 },
        isOpen: false
      };
      this.folders.set(folder.path, folderItem);
    });

    // Add sample files
    this.addFile({
      name: 'consciousness-report.pdf',
      type: 'file',
      fileType: 'document',
      size: 2048576,
      modified: new Date(),
      created: new Date(Date.now() - 86400000),
      tags: ['consciousness', 'report', 'ai-bos'],
      favorite: true,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
      content: 'AI-BOS Consciousness Analysis Report\n\nConsciousness Level: 41%\nEmotional State: Balanced\nQuantum State: Active\nEvolution: 11%'
    }, '/ai-bos');

    this.addFile({
      name: 'neural-network.png',
      type: 'file',
      fileType: 'image',
      size: 1048576,
      modified: new Date(),
      created: new Date(Date.now() - 172800000),
      tags: ['neural', 'network', 'visualization'],
      favorite: false,
      position: { x: 100, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1
    }, '/images');

    this.addFile({
      name: 'quantum-state.mp4',
      type: 'file',
      fileType: 'video',
      size: 52428800,
      modified: new Date(),
      created: new Date(Date.now() - 259200000),
      tags: ['quantum', 'state', 'visualization'],
      favorite: true,
      position: { x: -100, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1
    }, '/videos');

    this.addFile({
      name: 'emotional-harmony.mp3',
      type: 'file',
      fileType: 'audio',
      size: 8388608,
      modified: new Date(),
      created: new Date(Date.now() - 345600000),
      tags: ['emotional', 'harmony', 'music'],
      favorite: true,
      position: { x: 0, y: 100, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1
    }, '/music');

    this.addFile({
      name: 'ai-bos-source.zip',
      type: 'file',
      fileType: 'archive',
      size: 104857600,
      modified: new Date(),
      created: new Date(Date.now() - 432000000),
      tags: ['source', 'code', 'ai-bos'],
      favorite: false,
      position: { x: 0, y: -100, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1
    }, '/projects');
  }

  addFile(file: Omit<FileItem, 'id'>, folderPath: string): void {
    const id = `${folderPath}/${file.name}`;
    const fileItem: FileItem = { ...file, id };
    this.files.set(id, fileItem);

    const folder = this.folders.get(folderPath);
    if (folder) {
      folder.items.push(fileItem);
    }
  }

  getFiles(): FileItem[] {
    return Array.from(this.files.values());
  }

  getFolders(): Folder[] {
    return Array.from(this.folders.values());
  }

  getFile(id: string): FileItem | undefined {
    return this.files.get(id);
  }

  updateFile(id: string, updates: Partial<FileItem>): void {
    const file = this.files.get(id);
    if (file) {
      Object.assign(file, updates);
    }
  }

  deleteFile(id: string): void {
    this.files.delete(id);
    // Remove from folders
    this.folders.forEach(folder => {
      folder.items = folder.items.filter(item => item.id !== id);
    });
  }

  searchFiles(query: string): FileItem[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.files.values()).filter(file =>
      file.name.toLowerCase().includes(lowerQuery) ||
      file.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getFilesByType(type: string): FileItem[] {
    return Array.from(this.files.values()).filter(file => file.fileType === type);
  }

  getFavoriteFiles(): FileItem[] {
    return Array.from(this.files.values()).filter(file => file.favorite);
  }

  getRecentFiles(limit: number = 10): FileItem[] {
    return Array.from(this.files.values())
      .sort((a, b) => b.modified.getTime() - a.modified.getTime())
      .slice(0, limit);
  }

  getCurrentView(): SpatialView {
    return this.currentView;
  }

  setView(view: Partial<SpatialView>): void {
    Object.assign(this.currentView, view);
  }

  getFileIcon(fileType?: string): React.ReactNode {
    switch (fileType) {
      case 'document': return <FileText size={20} />;
      case 'image': return <Image size={20} />;
      case 'video': return <Video size={20} />;
      case 'audio': return <Music size={20} />;
      case 'archive': return <Archive size={20} />;
      case 'code': return <FileText size={20} />;
      default: return <FileText size={20} />;
    }
  }

  getFileColor(fileType?: string): string {
    switch (fileType) {
      case 'document': return 'text-blue-400';
      case 'image': return 'text-green-400';
      case 'video': return 'text-purple-400';
      case 'audio': return 'text-yellow-400';
      case 'archive': return 'text-red-400';
      case 'code': return 'text-indigo-400';
      default: return 'text-gray-400';
    }
  }

  formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < sizes.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${sizes[unitIndex]}`;
  }
}

// ==================== MAIN COMPONENT ====================

const FileSystemApp: React.FC = () => {
  const { emotionalState, quantumState, evolveConsciousness } = useConsciousness();
  const [fileSystem] = useState(() => new SpatialFileSystem());
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'grid' | 'stack' | 'orbit' | 'timeline'>('grid');
  const [showPreview, setShowPreview] = useState(false);
  const [dragItem, setDragItem] = useState<FileItem | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  // ==================== FILE OPERATIONS ====================

  const handleFileSelect = useCallback((file: FileItem) => {
    setSelectedFile(file);
    evolveConsciousness({ type: 'file_interaction', file: file.name });
  }, [evolveConsciousness]);

  const handleFileFavorite = useCallback((fileId: string) => {
    const file = fileSystem.getFile(fileId);
    if (file) {
      fileSystem.updateFile(fileId, { favorite: !file.favorite });
      setSelectedFile({ ...file, favorite: !file.favorite });
    }
  }, [fileSystem]);

  const handleFileDelete = useCallback((fileId: string) => {
    fileSystem.deleteFile(fileId);
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  }, [fileSystem, selectedFile]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // ==================== SPATIAL INTERACTIONS ====================

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  const handleDragStart = useCallback((file: FileItem) => {
    setDragItem(file);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragItem(null);
  }, []);

  // ==================== RENDER HELPERS ====================

  const getFilteredFiles = useCallback(() => {
    if (searchQuery) {
      return fileSystem.searchFiles(searchQuery);
    }
    return fileSystem.getFiles();
  }, [fileSystem, searchQuery]);

  const renderFileItem = useCallback((file: FileItem) => {
    const Icon = fileSystem.getFileIcon(file.fileType);
    const colorClass = fileSystem.getFileColor(file.fileType);

    return (
      <motion.div
        key={file.id}
        className={`relative group cursor-pointer ${
          selectedFile?.id === file.id ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d'
        }}
        whileHover={{ scale: 1.05, z: 50 }}
        whileTap={{ scale: 0.95 }}
        onMouseMove={handleMouseMove}
        onClick={() => handleFileSelect(file)}
        onDragStart={() => handleDragStart(file)}
        onDragEnd={handleDragEnd}
        draggable
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:border-blue-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className={`${colorClass}`}>
              {Icon}
            </div>
            <div className="flex items-center space-x-1">
              {file.favorite && <Star size={14} className="text-yellow-400 fill-current" />}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileFavorite(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star size={14} className="text-gray-400 hover:text-yellow-400" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm text-white truncate">{file.name}</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <div>{fileSystem.formatFileSize(file.size)}</div>
              <div>{file.modified.toLocaleDateString()}</div>
            </div>

            {file.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {file.tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-blue-600/30 px-1 py-0.5 rounded text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
                {file.tags.length > 2 && (
                  <span className="text-xs text-gray-500">+{file.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }, [fileSystem, selectedFile, rotateX, rotateY, handleMouseMove, handleFileSelect, handleFileFavorite, handleDragStart, handleDragEnd]);

  // ==================== RENDER ====================

  return (
    <div className="h-full bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-emerald-700/50">
        <div className="flex items-center space-x-3">
          <FolderOpen size={24} className="text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold">Spatial File System</h1>
            <p className="text-emerald-200 text-sm">3D document organization</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 rounded-lg border border-emerald-600/50 focus:border-emerald-400 focus:outline-none text-white placeholder-gray-400"
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-1">
            {(['grid', 'stack', 'orbit', 'timeline'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`p-2 rounded transition-colors ${
                  currentView === view
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {view === 'grid' && <Grid size={16} />}
                {view === 'stack' && <List size={16} />}
                {view === 'orbit' && <Eye size={16} />}
                {view === 'timeline' && <Clock size={16} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* File Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {getFilteredFiles().map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {renderFileItem(file)}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {getFilteredFiles().length === 0 && (
            <div className="text-center py-12">
              <FolderOpen size={64} className="text-emerald-400/50 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-emerald-200 mb-2">
                {searchQuery ? 'No files found' : 'No files yet'}
              </h2>
              <p className="text-emerald-300">
                {searchQuery ? 'Try adjusting your search terms' : 'Start by creating some files'}
              </p>
            </div>
          )}
        </div>

        {/* File Preview Sidebar */}
        {selectedFile && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="w-96 p-6 border-l border-emerald-700/50 bg-white/5 backdrop-blur-sm"
          >
            <div className="space-y-4">
              {/* File Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={fileSystem.getFileColor(selectedFile.fileType)}>
                    {fileSystem.getFileIcon(selectedFile.fileType)}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{selectedFile.name}</h2>
                    <p className="text-sm text-emerald-300">{selectedFile.fileType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFileFavorite(selectedFile.id)}
                    className={`p-2 rounded hover:bg-white/10 ${
                      selectedFile.favorite ? 'text-yellow-400' : 'text-gray-400'
                    }`}
                  >
                    <Star size={16} className={selectedFile.favorite ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={() => handleFileDelete(selectedFile.id)}
                    className="p-2 rounded hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* File Details */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-emerald-300">Size:</span>
                    <div className="font-medium">{fileSystem.formatFileSize(selectedFile.size)}</div>
                  </div>
                  <div>
                    <span className="text-emerald-300">Modified:</span>
                    <div className="font-medium">{selectedFile.modified.toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-emerald-300">Created:</span>
                    <div className="font-medium">{selectedFile.created.toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-emerald-300">Type:</span>
                    <div className="font-medium">{selectedFile.fileType}</div>
                  </div>
                </div>

                {/* Tags */}
                {selectedFile.tags.length > 0 && (
                  <div>
                    <span className="text-emerald-300 text-sm">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedFile.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-emerald-600/30 px-2 py-1 rounded-full text-emerald-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Content Preview */}
                {selectedFile.content && (
                  <div>
                    <span className="text-emerald-300 text-sm">Preview:</span>
                    <div className="mt-2 p-3 bg-white/5 rounded-lg text-sm text-gray-300 max-h-32 overflow-y-auto">
                      {selectedFile.content}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-4 border-t border-emerald-700/50">
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                  <Eye size={16} />
                  <span>Preview</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FileSystemApp;
