/**
 * AI-BOS Community Templates - User Collections Component
 *
 * Comprehensive user collections management for organizing, sharing,
 * and collaborating on template collections.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  Plus,
  Edit,
  Trash2,
  Share2,
  Users,
  Lock,
  Globe,
  Star,
  Bookmark,
  Download,
  Eye,
  MoreVertical,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Calendar,
  Tag,
  Heart,
  MessageCircle,
  Copy,
  Link,
  Settings,
  UserPlus,
  UserMinus,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

// AI-BOS Shared Library Integration
import type { EventBus } from '@aibos/shared/lib';
import { logger, EventBusEvents } from '@aibos/shared/lib';

// Types
import type {
  UserCollection,
  AppTemplate,
  CollectionPermission,
  CollectionStats,
  CollectionShareSettings,
} from '../types';

// Components
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorBoundary } from './ErrorBoundary';

// ============================================================================
// COLLECTION TYPES
// ============================================================================

export interface UserCollectionsProps {
  /** User collections */
  collections: UserCollection[];
  /** Available templates */
  templates: AppTemplate[];
  /** Current user ID */
  userId: string;
  /** Event bus for tracking */
  eventBus?: EventBus;
  /** On collection create callback */
  onCreateCollection?: (collection: Partial<UserCollection>) => Promise<void>;
  /** On collection update callback */
  onUpdateCollection?: (collectionId: string, updates: Partial<UserCollection>) => Promise<void>;
  /** On collection delete callback */
  onDeleteCollection?: (collectionId: string) => Promise<void>;
  /** On collection share callback */
  onShareCollection?: (collectionId: string, settings: CollectionShareSettings) => Promise<void>;
  /** On template add to collection callback */
  onAddTemplateToCollection?: (collectionId: string, templateId: string) => Promise<void>;
  /** On template remove from collection callback */
  onRemoveTemplateFromCollection?: (collectionId: string, templateId: string) => Promise<void>;
  /** On collection view callback */
  onViewCollection?: (collection: UserCollection) => void;
  /** Enable sharing */
  enableSharing?: boolean;
  /** Enable collaboration */
  enableCollaboration?: boolean;
  /** Enable analytics */
  enableAnalytics?: boolean;
}

export interface CollectionFormData {
  name: string;
  description: string;
  isPublic: boolean;
  allowCollaboration: boolean;
  tags: string[];
  coverImage?: string;
}

// ============================================================================
// COLLECTION COMPONENT
// ============================================================================

/**
 * User Collections Component
 */
export const UserCollections: React.FC<UserCollectionsProps> = ({
  collections,
  templates,
  userId,
  eventBus,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onShareCollection,
  onAddTemplateToCollection,
  onRemoveTemplateFromCollection,
  onViewCollection,
  enableSharing = true,
  enableCollaboration = true,
  enableAnalytics = true,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedCollection, setSelectedCollection] = useState<UserCollection | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated' | 'templates' | 'views'>(
    'updated',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Filter and sort collections
   */
  const filteredCollections = useMemo(() => {
    const filtered = collections.filter((collection) => {
      const matchesSearch =
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 || selectedTags.some((tag) => collection.tags.includes(tag));

      return matchesSearch && matchesTags;
    });

    // Sort collections
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updated':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case 'templates':
          aValue = a.templates.length;
          bValue = b.templates.length;
          break;
        case 'views':
          aValue = a.stats?.views || 0;
          bValue = b.stats?.views || 0;
          break;
        default:
          aValue = a.updatedAt;
          bValue = b.updatedAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [collections, searchQuery, selectedTags, sortBy, sortOrder]);

  /**
   * Get all available tags
   */
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    collections.forEach((collection) => {
      collection.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [collections]);

  /**
   * Get collection stats
   */
  const collectionStats = useMemo(() => {
    const totalCollections = collections.length;
    const publicCollections = collections.filter((c) => c.isPublic).length;
    const totalTemplates = collections.reduce((sum, c) => sum + c.templates.length, 0);
    const totalViews = collections.reduce((sum, c) => sum + (c.stats?.views || 0), 0);
    const totalLikes = collections.reduce((sum, c) => sum + (c.stats?.likes || 0), 0);

    return {
      totalCollections,
      publicCollections,
      totalTemplates,
      totalViews,
      totalLikes,
      averageTemplatesPerCollection:
        totalCollections > 0 ? (totalTemplates / totalCollections).toFixed(1) : '0',
    };
  }, [collections]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle collection creation
   */
  const handleCreateCollection = useCallback(
    async (formData: CollectionFormData) => {
      setIsLoading(true);

      try {
        const newCollection: Partial<UserCollection> = {
          name: formData.name,
          description: formData.description,
          isPublic: formData.isPublic,
          allowCollaboration: formData.allowCollaboration,
          tags: formData.tags,
          coverImage: formData.coverImage,
          ownerId: userId,
          templates: [],
          collaborators: [],
          permissions: {
            owner: ['read', 'write', 'delete', 'share'],
            collaborators: ['read', 'write'],
            public: formData.isPublic ? ['read'] : [],
          },
          stats: {
            views: 0,
            likes: 0,
            shares: 0,
            downloads: 0,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        await onCreateCollection?.(newCollection);
        setShowCreateModal(false);

        eventBus?.emit('collection:created', {
          collectionId: newCollection.id,
          userId,
          timestamp: Date.now(),
        });

        logger.info('Collection created', { collectionName: formData.name, userId });
      } catch (error) {
        logger.error('Failed to create collection', { error, formData });
      } finally {
        setIsLoading(false);
      }
    },
    [onCreateCollection, userId, eventBus],
  );

  /**
   * Handle collection update
   */
  const handleUpdateCollection = useCallback(
    async (collectionId: string, updates: Partial<UserCollection>) => {
      setIsLoading(true);

      try {
        await onUpdateCollection?.(collectionId, {
          ...updates,
          updatedAt: Date.now(),
        });
        setShowEditModal(false);

        eventBus?.emit('collection:updated', {
          collectionId,
          userId,
          timestamp: Date.now(),
        });

        logger.info('Collection updated', { collectionId, userId });
      } catch (error) {
        logger.error('Failed to update collection', { error, collectionId });
      } finally {
        setIsLoading(false);
      }
    },
    [onUpdateCollection, userId, eventBus],
  );

  /**
   * Handle collection deletion
   */
  const handleDeleteCollection = useCallback(
    async (collectionId: string) => {
      setIsLoading(true);

      try {
        await onDeleteCollection?.(collectionId);
        setShowDeleteModal(false);

        eventBus?.emit('collection:deleted', {
          collectionId,
          userId,
          timestamp: Date.now(),
        });

        logger.info('Collection deleted', { collectionId, userId });
      } catch (error) {
        logger.error('Failed to delete collection', { error, collectionId });
      } finally {
        setIsLoading(false);
      }
    },
    [onDeleteCollection, userId, eventBus],
  );

  /**
   * Handle collection sharing
   */
  const handleShareCollection = useCallback(
    async (collectionId: string, settings: CollectionShareSettings) => {
      setIsLoading(true);

      try {
        await onShareCollection?.(collectionId, settings);

        eventBus?.emit('collection:shared', {
          collectionId,
          userId,
          settings,
          timestamp: Date.now(),
        });

        logger.info('Collection shared', { collectionId, userId, settings });
      } catch (error) {
        logger.error('Failed to share collection', { error, collectionId });
      } finally {
        setIsLoading(false);
      }
    },
    [onShareCollection, userId, eventBus],
  );

  /**
   * Handle template addition to collection
   */
  const handleAddTemplateToCollection = useCallback(
    async (collectionId: string, templateId: string) => {
      try {
        await onAddTemplateToCollection?.(collectionId, templateId);

        eventBus?.emit('collection:template-added', {
          collectionId,
          templateId,
          userId,
          timestamp: Date.now(),
        });

        logger.info('Template added to collection', { collectionId, templateId, userId });
      } catch (error) {
        logger.error('Failed to add template to collection', { error, collectionId, templateId });
      }
    },
    [onAddTemplateToCollection, userId, eventBus],
  );

  /**
   * Handle template removal from collection
   */
  const handleRemoveTemplateFromCollection = useCallback(
    async (collectionId: string, templateId: string) => {
      try {
        await onRemoveTemplateFromCollection?.(collectionId, templateId);

        eventBus?.emit('collection:template-removed', {
          collectionId,
          templateId,
          userId,
          timestamp: Date.now(),
        });

        logger.info('Template removed from collection', { collectionId, templateId, userId });
      } catch (error) {
        logger.error('Failed to remove template from collection', {
          error,
          collectionId,
          templateId,
        });
      }
    },
    [onRemoveTemplateFromCollection, userId, eventBus],
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render collection card
   */
  const renderCollectionCard = (collection: UserCollection) => {
    const isOwner = collection.ownerId === userId;
    const hasCollaborators = collection.collaborators.length > 0;

    return (
      <motion.div
        key={collection.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
      >
        {/* Cover Image */}
        <div className="relative h-48 bg-gray-100">
          {collection.coverImage ? (
            <img
              src={collection.coverImage}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Folder className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex space-x-2">
            {collection.isPublic ? (
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </div>
            )}

            {hasCollaborators && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                <Users className="w-3 h-3" />
                <span>{collection.collaborators.length}</span>
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <div className="absolute top-3 right-3">
            <div className="relative group">
              <button className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>

              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedCollection(collection);
                      onViewCollection?.(collection);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedCollection(collection);
                          setShowEditModal(true);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>

                      {enableSharing && (
                        <button
                          onClick={() => {
                            setSelectedCollection(collection);
                            setShowShareModal(true);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                      )}
                    </>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => {
                        setSelectedCollection(collection);
                        setShowDeleteModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 truncate flex-1">{collection.name}</h3>
            {collection.isStarred && (
              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0 ml-2" />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{collection.description}</p>

          {/* Tags */}
          {collection.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {collection.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {collection.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{collection.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{collection.templates.length}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{collection.stats?.views || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{collection.stats?.likes || 0}</span>
              </div>
            </div>

            <div className="text-xs">{new Date(collection.updatedAt).toLocaleDateString()}</div>
          </div>

          {/* Owner/Collaborator Info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isOwner ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">Owner</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-600">Collaborator</span>
                  </>
                )}
              </div>

              {collection.ownerId !== userId && (
                <span className="text-xs text-gray-500">
                  by {collection.owner?.name || 'Unknown'}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  /**
   * Render collection list item
   */
  const renderCollectionListItem = (collection: UserCollection) => {
    const isOwner = collection.ownerId === userId;

    return (
      <motion.div
        key={collection.id}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center space-x-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Folder className="w-6 h-6 text-gray-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{collection.name}</h3>
              {collection.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              {collection.isPublic ? (
                <Globe className="w-4 h-4 text-blue-600" />
              ) : (
                <Lock className="w-4 h-4 text-gray-600" />
              )}
            </div>

            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{collection.description}</p>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{collection.templates.length} templates</span>
              <span>{collection.stats?.views || 0} views</span>
              <span>{collection.stats?.likes || 0} likes</span>
              <span>Updated {new Date(collection.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewCollection?.(collection)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="View collection"
            >
              <Eye className="w-4 h-4" />
            </button>

            {isOwner && (
              <button
                onClick={() => {
                  setSelectedCollection(collection);
                  setShowEditModal(true);
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                title="Edit collection"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            {enableSharing && (
              <button
                onClick={() => {
                  setSelectedCollection(collection);
                  setShowShareModal(true);
                }}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                title="Share collection"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => {
                  setSelectedCollection(collection);
                  setShowDeleteModal(true);
                }}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                title="Delete collection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <ErrorBoundary componentName="UserCollections">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Collections</h1>
            <p className="text-gray-600">Organize and share your favorite templates</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        </div>

        {/* Stats */}
        {enableAnalytics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {collectionStats.totalCollections}
              </div>
              <div className="text-sm text-gray-600">Collections</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {collectionStats.publicCollections}
              </div>
              <div className="text-sm text-gray-600">Public</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {collectionStats.totalTemplates}
              </div>
              <div className="text-sm text-gray-600">Templates</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{collectionStats.totalViews}</div>
              <div className="text-sm text-gray-600">Views</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{collectionStats.totalLikes}</div>
              <div className="text-sm text-gray-600">Likes</div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tags Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedTags[0] || ''}
                onChange={(e) => setSelectedTags(e.target.value ? [e.target.value] : [])}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="templates">Templates</option>
                <option value="views">Views</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Collections Grid/List */}
        <AnimatePresence mode="wait">
          {filteredCollections.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCollections.map(renderCollectionCard)}
              </div>
            ) : (
              <div className="space-y-4">{filteredCollections.map(renderCollectionListItem)}</div>
            )
          ) : (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || selectedTags.length > 0
                  ? 'No collections found'
                  : 'No collections yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || selectedTags.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Create your first collection to get started'}
              </p>
              {!searchQuery && selectedTags.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Collection</span>
                </button>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6">
            <LoadingSkeleton variant="card" count={4} />
          </div>
        )}
      </div>

      {/* Modals would be implemented here */}
      {/* Create Collection Modal */}
      {/* Edit Collection Modal */}
      {/* Share Collection Modal */}
      {/* Delete Collection Modal */}
    </ErrorBoundary>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default UserCollections;
