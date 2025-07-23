/**
 * AI-BOS Community Templates - Template Versioning Component
 *
 * Comprehensive template versioning interface for managing versions,
 * changelogs, and update notifications with rollback capabilities.
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  GitCommit,
  GitCompare,
  History,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Upload,
  ArrowUp,
  FileText,
  Star,
  Eye,
  Download as DownloadIcon,
  RotateCcw,
  Check,
  X,
  Plus,
} from 'lucide-react';
import type {
  GitMerge,
  GitPullRequest,
  GitBranchPlus,
  GitBranchMinus,
  Clock,
  MessageSquare,
  XCircle,
  Download,
  RefreshCw,
  ArrowDown,
  ExternalLink,
  Code,
  Package,
  Shield,
  Upload as UploadIcon,
  Save,
  Edit,
  Trash2,
  MoreVertical,
  Info,
  Warning,
  Minus,
  Hash,
  Tag,
  Branch,
  Commit,
  Merge,
  PullRequest,
  Compare,
  BranchPlus,
  BranchMinus,
  History as HistoryIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  MessageSquare as MessageSquareIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Download as DownloadIcon2,
  Upload as UploadIcon2,
  RefreshCw as RefreshCwIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ExternalLink as ExternalLinkIcon,
  Code as CodeIcon,
  FileText as FileTextIcon,
  Package as PackageIcon,
  Shield as ShieldIcon,
  Star as StarIcon,
  Eye as EyeIcon,
  Download as DownloadIcon3,
  Upload as UploadIcon3,
  RotateCcw as RotateCcwIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  MoreVertical as MoreVerticalIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  X as XIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Hash as HashIcon,
  Tag as TagIcon,
} from 'lucide-react';

// AI-BOS Shared Library Integration
import type { EventBus } from '@aibos/shared/lib';
import { logger } from '@aibos/shared/lib';

// Types
import type {
  AppTemplate,
  TemplateVersion,
  VersionChange,
  VersionComparison,
  VersionMetadata,
  ChangelogEntry,
} from '../types';

// Components
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorBoundary } from './ErrorBoundary';

// ============================================================================
// VERSIONING TYPES
// ============================================================================

export interface TemplateVersioningProps {
  /** Template to version */
  template: AppTemplate;
  /** Template versions */
  versions: TemplateVersion[];
  /** Current version */
  currentVersion?: string;
  /** Event bus for tracking */
  eventBus?: EventBus;
  /** On version select callback */
  onVersionSelect?: (version: string) => Promise<void>;
  /** On version rollback callback */
  onVersionRollback?: (version: string) => Promise<void>;
  /** On version compare callback */
  onVersionCompare?: (fromVersion: string, toVersion: string) => Promise<void>;
  /** On version download callback */
  onVersionDownload?: (version: string) => Promise<void>;
  /** On version upload callback */
  onVersionUpload?: (file: File) => Promise<void>;
  /** On changelog update callback */
  onChangelogUpdate?: (version: string, changelog: string) => Promise<void>;
  /** Enable version comparison */
  enableComparison?: boolean;
  /** Enable rollback */
  enableRollback?: boolean;
  /** Enable version upload */
  enableUpload?: boolean;
  /** Show detailed changelog */
  showDetailedChangelog?: boolean;
}

export interface VersionDiff {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
}

// ============================================================================
// VERSIONING COMPONENT
// ============================================================================

/**
 * Template Versioning Component
 */
export const TemplateVersioning: React.FC<TemplateVersioningProps> = ({
  template,
  versions,
  currentVersion,
  eventBus,
  onVersionSelect,
  onVersionRollback,
  onVersionCompare,
  onVersionDownload,
  onVersionUpload,
  onChangelogUpdate,
  enableComparison = true,
  enableRollback = true,
  enableUpload = true,
  showDetailedChangelog = false,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [selectedVersion, setSelectedVersion] = useState<string | null>(currentVersion || null);
  const [compareFrom, setCompareFrom] = useState<string | null>(null);
  const [compareTo, setCompareTo] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [changelogText, setChangelogText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'graph'>('timeline');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Sort versions by date
   */
  const sortedVersions = useMemo(() => {
    return [...versions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [versions]);

  /**
   * Get current version info
   */
  const currentVersionInfo = useMemo(() => {
    return versions.find((v) => v.version === currentVersion) || sortedVersions[0];
  }, [versions, currentVersion, sortedVersions]);

  /**
   * Get selected version info
   */
  const selectedVersionInfo = useMemo(() => {
    return versions.find((v) => v.version === selectedVersion);
  }, [versions, selectedVersion]);

  /**
   * Get version comparison data
   */
  const versionComparison = useMemo(() => {
    if (!compareFrom || !compareTo) return null;

    const fromVersion = versions.find((v) => v.version === compareFrom);
    const toVersion = versions.find((v) => v.version === compareTo);

    if (!fromVersion || !toVersion) return null;

    return {
      from: fromVersion,
      to: toVersion,
      changes: toVersion.changes || [],
      breakingChanges: toVersion.breakingChanges || [],
      newFeatures: toVersion.newFeatures || [],
      bugFixes: toVersion.bugFixes || [],
      improvements: toVersion.improvements || [],
    };
  }, [compareFrom, compareTo, versions]);

  /**
   * Get version statistics
   */
  const versionStats = useMemo(() => {
    const totalVersions = versions.length;
    const majorVersions = versions.filter(
      (v) => v.version.startsWith('v1.') || v.version.startsWith('v2.'),
    ).length;
    const minorVersions = versions.filter(
      (v) =>
        v.version.includes('.') && !v.version.startsWith('v1.') && !v.version.startsWith('v2.'),
    ).length;
    const patchVersions = versions.filter((v) => !v.version.includes('.')).length;
    const breakingChanges = versions.reduce((sum, v) => sum + (v.breakingChanges?.length || 0), 0);
    const totalDownloads = versions.reduce((sum, v) => sum + (v.downloads || 0), 0);

    return {
      totalVersions,
      majorVersions,
      minorVersions,
      patchVersions,
      breakingChanges,
      totalDownloads,
      averageDownloadsPerVersion:
        totalVersions > 0 ? Math.round(totalDownloads / totalVersions) : 0,
    };
  }, [versions]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle version selection
   */
  const handleVersionSelect = useCallback(
    async (version: string) => {
      setSelectedVersion(version);

      try {
        await onVersionSelect?.(version);

        eventBus?.emit('template:version-selected', {
          templateId: template.id,
          version,
          timestamp: Date.now(),
        });

        logger.info('Version selected', { templateId: template.id, version });
      } catch (error) {
        logger.error('Failed to select version', { error, templateId: template.id, version });
      }
    },
    [onVersionSelect, template.id, eventBus],
  );

  /**
   * Handle version rollback
   */
  const handleVersionRollback = useCallback(
    async (version: string) => {
      if (!enableRollback) return;

      setIsLoading(true);

      try {
        await onVersionRollback?.(version);

        eventBus?.emit('template:version-rollback', {
          templateId: template.id,
          version,
          timestamp: Date.now(),
        });

        logger.info('Version rollback', { templateId: template.id, version });
      } catch (error) {
        logger.error('Failed to rollback version', { error, templateId: template.id, version });
      } finally {
        setIsLoading(false);
      }
    },
    [enableRollback, onVersionRollback, template.id, eventBus],
  );

  /**
   * Handle version comparison
   */
  const handleVersionCompare = useCallback(
    async (fromVersion: string, toVersion: string) => {
      if (!enableComparison) return;

      setIsLoading(true);

      try {
        await onVersionCompare?.(fromVersion, toVersion);
        setShowComparison(true);

        eventBus?.emit('template:version-compare', {
          templateId: template.id,
          fromVersion,
          toVersion,
          timestamp: Date.now(),
        });

        logger.info('Version comparison', { templateId: template.id, fromVersion, toVersion });
      } catch (error) {
        logger.error('Failed to compare versions', {
          error,
          templateId: template.id,
          fromVersion,
          toVersion,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [enableComparison, onVersionCompare, template.id, eventBus],
  );

  /**
   * Handle version download
   */
  const handleVersionDownload = useCallback(
    async (version: string) => {
      try {
        await onVersionDownload?.(version);

        eventBus?.emit('template:version-download', {
          templateId: template.id,
          version,
          timestamp: Date.now(),
        });

        logger.info('Version downloaded', { templateId: template.id, version });
      } catch (error) {
        logger.error('Failed to download version', { error, templateId: template.id, version });
      }
    },
    [onVersionDownload, template.id, eventBus],
  );

  /**
   * Handle version upload
   */
  const handleVersionUpload = useCallback(async () => {
    if (!uploadFile) return;

    setIsLoading(true);

    try {
      await onVersionUpload?.(uploadFile);
      setShowUploadModal(false);
      setUploadFile(null);

      eventBus?.emit('template:version-upload', {
        templateId: template.id,
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        timestamp: Date.now(),
      });

      logger.info('Version uploaded', { templateId: template.id, fileName: uploadFile.name });
    } catch (error) {
      logger.error('Failed to upload version', { error, templateId: template.id });
    } finally {
      setIsLoading(false);
    }
  }, [uploadFile, onVersionUpload, template.id, eventBus]);

  /**
   * Handle changelog update
   */
  const handleChangelogUpdate = useCallback(async () => {
    if (!selectedVersion || !changelogText.trim()) return;

    setIsLoading(true);

    try {
      await onChangelogUpdate?.(selectedVersion, changelogText);
      setShowChangelogModal(false);
      setChangelogText('');

      eventBus?.emit('template:changelog-updated', {
        templateId: template.id,
        version: selectedVersion,
        timestamp: Date.now(),
      });

      logger.info('Changelog updated', { templateId: template.id, version: selectedVersion });
    } catch (error) {
      logger.error('Failed to update changelog', {
        error,
        templateId: template.id,
        version: selectedVersion,
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedVersion, changelogText, onChangelogUpdate, template.id, eventBus]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render version card
   */
  const renderVersionCard = (version: TemplateVersion) => {
    const isCurrent = version.version === currentVersion;
    const isSelected = version.version === selectedVersion;
    const isLatest = version.version === sortedVersions[0]?.version;

    return (
      <motion.div
        key={version.version}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
          isCurrent
            ? 'border-green-500 shadow-lg'
            : isSelected
              ? 'border-blue-500 shadow-md'
              : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleVersionSelect(version.version)}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{version.version}</h3>
              {isCurrent && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Current
                </span>
              )}
              {isLatest && !isCurrent && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Latest
                </span>
              )}
              {version.isStable && <CheckCircle className="w-4 h-4 text-green-600" />}
              {version.breakingChanges && version.breakingChanges.length > 0 && (
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              )}
            </div>

            <div className="flex items-center space-x-1">
              {enableComparison && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCompareFrom(version.version);
                  }}
                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                  title="Compare from this version"
                >
                  <GitCompare className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVersionDownload(version.version);
                }}
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                title="Download version"
              >
                <DownloadIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {version.description || 'No description available'}
          </p>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(version.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{version.author?.name || 'Unknown'}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{version.downloads || 0}</div>
              <div className="text-gray-500">Downloads</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{version.changes?.length || 0}</div>
              <div className="text-gray-500">Changes</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {version.breakingChanges?.length || 0}
              </div>
              <div className="text-gray-500">Breaking</div>
            </div>
          </div>

          {/* Tags */}
          {version.tags && version.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {version.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {version.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{version.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {enableRollback && !isCurrent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVersionRollback(version.version);
                }}
                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rollback</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVersion(version.version);
                setShowChangelogModal(true);
              }}
              className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800"
            >
              <FileText className="w-3 h-3" />
              <span>Changelog</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  /**
   * Render version timeline
   */
  const renderVersionTimeline = () => {
    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {sortedVersions.map((version, index) => {
            const isCurrent = version.version === currentVersion;
            const isLatest = index === 0;

            return (
              <motion.div
                key={version.version}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative flex items-start space-x-4"
              >
                {/* Timeline dot */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center ${
                    isCurrent
                      ? 'bg-green-500 border-green-500 text-white'
                      : isLatest
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-600'
                  }`}
                >
                  {isCurrent ? (
                    <Check className="w-6 h-6" />
                  ) : isLatest ? (
                    <Star className="w-6 h-6" />
                  ) : (
                    <GitCommit className="w-6 h-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{version.version}</h3>
                      {isCurrent && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Current
                        </span>
                      )}
                      {isLatest && !isCurrent && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Latest
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleVersionSelect(version.version)}
                        className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {version.description || 'No description available'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>{version.downloads || 0} downloads</span>
                      <span>{version.changes?.length || 0} changes</span>
                      <span>{version.breakingChanges?.length || 0} breaking</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{version.author?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * Render version comparison
   */
  const renderVersionComparison = () => {
    if (!versionComparison) return null;

    const { from, to, changes, breakingChanges, newFeatures, bugFixes, improvements } =
      versionComparison;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Version Comparison</h3>
          <button
            onClick={() => setShowComparison(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version headers */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900">{from.version}</h4>
            <p className="text-sm text-gray-600">{new Date(from.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900">{to.version}</h4>
            <p className="text-sm text-gray-600">{new Date(to.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Changes summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{newFeatures.length}</div>
            <div className="text-sm text-blue-800">New Features</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{bugFixes.length}</div>
            <div className="text-sm text-green-800">Bug Fixes</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{improvements.length}</div>
            <div className="text-sm text-yellow-800">Improvements</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{breakingChanges.length}</div>
            <div className="text-sm text-red-800">Breaking Changes</div>
          </div>
        </div>

        {/* Detailed changes */}
        <div className="space-y-4">
          {breakingChanges.length > 0 && (
            <div>
              <h5 className="font-semibold text-red-800 mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Breaking Changes</span>
              </h5>
              <ul className="space-y-1">
                {breakingChanges.map((change, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {newFeatures.length > 0 && (
            <div>
              <h5 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Features</span>
              </h5>
              <ul className="space-y-1">
                {newFeatures.map((feature, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bugFixes.length > 0 && (
            <div>
              <h5 className="font-semibold text-green-800 mb-2 flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Bug Fixes</span>
              </h5>
              <ul className="space-y-1">
                {bugFixes.map((fix, index) => (
                  <li key={index} className="text-sm text-green-700 flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {improvements.length > 0 && (
            <div>
              <h5 className="font-semibold text-yellow-800 mb-2 flex items-center space-x-2">
                <ArrowUp className="w-4 h-4" />
                <span>Improvements</span>
              </h5>
              <ul className="space-y-1">
                {improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start space-x-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <ErrorBoundary componentName="TemplateVersioning">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Version History</h1>
            <p className="text-gray-600">{template.name} - Manage versions and track changes</p>
          </div>

          <div className="flex items-center space-x-3">
            {enableUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Version</span>
              </button>
            )}

            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded ${
                  viewMode === 'timeline'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Timeline view"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="List view"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`p-2 rounded ${
                  viewMode === 'graph'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                title="Graph view"
              >
                <GitBranch className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Version Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{versionStats.totalVersions}</div>
            <div className="text-sm text-gray-600">Total Versions</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{versionStats.majorVersions}</div>
            <div className="text-sm text-gray-600">Major</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{versionStats.minorVersions}</div>
            <div className="text-sm text-gray-600">Minor</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{versionStats.patchVersions}</div>
            <div className="text-sm text-gray-600">Patch</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{versionStats.breakingChanges}</div>
            <div className="text-sm text-gray-600">Breaking</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{versionStats.totalDownloads}</div>
            <div className="text-sm text-gray-600">Downloads</div>
          </div>
        </div>

        {/* Current Version Info */}
        {currentVersionInfo && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Current Version: {currentVersionInfo.version}
                </h2>
                <p className="text-gray-600">
                  {currentVersionInfo.description || 'No description available'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Active
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(currentVersionInfo.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {currentVersionInfo.downloads || 0}
                </div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {currentVersionInfo.changes?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Changes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {currentVersionInfo.breakingChanges?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Breaking</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {currentVersionInfo.isStable ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-gray-600">Stable</div>
              </div>
            </div>
          </div>
        )}

        {/* Version Comparison Controls */}
        {enableComparison && (compareFrom || compareTo) && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Compare:</span>
                <select
                  value={compareFrom || ''}
                  onChange={(e) => setCompareFrom(e.target.value || null)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select version...</option>
                  {sortedVersions.map((version) => (
                    <option key={version.version} value={version.version}>
                      {version.version}
                    </option>
                  ))}
                </select>
                <span className="text-gray-400">→</span>
                <select
                  value={compareTo || ''}
                  onChange={(e) => setCompareTo(e.target.value || null)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select version...</option>
                  {sortedVersions.map((version) => (
                    <option key={version.version} value={version.version}>
                      {version.version}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (compareFrom && compareTo) {
                      handleVersionCompare(compareFrom, compareTo);
                    }
                  }}
                  disabled={!compareFrom || !compareTo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Compare
                </button>
                <button
                  onClick={() => {
                    setCompareFrom(null);
                    setCompareTo(null);
                    setShowComparison(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version Comparison Results */}
        {showComparison && versionComparison && renderVersionComparison()}

        {/* Versions Display */}
        {!showComparison && (
          <div className="space-y-6">
            {viewMode === 'timeline' ? (
              renderVersionTimeline()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedVersions.map(renderVersionCard)}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-6">
            <LoadingSkeleton variant="card" count={3} />
          </div>
        )}

        {/* Empty State */}
        {versions.length === 0 && (
          <div className="text-center py-12">
            <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No versions available</h3>
            <p className="text-gray-500">Upload the first version to get started</p>
          </div>
        )}
      </div>

      {/* Modals would be implemented here */}
      {/* Upload Version Modal */}
      {/* Changelog Modal */}
    </ErrorBoundary>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default TemplateVersioning;
