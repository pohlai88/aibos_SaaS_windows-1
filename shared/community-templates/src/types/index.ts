/**
 * AI-BOS Community Templates - Type Definitions
 *
 * Comprehensive type definitions for the community templates marketplace
 * including enhanced features for versioning, collections, and dependencies.
 */

// ============================================================================
// CORE TEMPLATE TYPES
// ============================================================================

export type TemplateCategory =
  | 'business'
  | 'ecommerce'
  | 'blog'
  | 'portfolio'
  | 'dashboard'
  | 'social'
  | 'productivity'
  | 'landing'
  | 'education'
  | 'saas';

export type TemplateComplexity = 'beginner' | 'intermediate' | 'advanced';
export type PricingType = 'free' | 'premium' | 'subscription';
export type RecommendationType =
  | 'user-preference'
  | 'collaborative-filtering'
  | 'content-based'
  | 'trending';

// ============================================================================
// TEMPLATE VERSIONING
// ============================================================================

export interface TemplateVersion {
  id: string;
  version: string;
  changelog: string;
  createdAt: number;
  downloadUrl: string;
  size: number;
  dependencies: Record<string, string>;
  breakingChanges: boolean;
  releaseNotes: string;
  compatibility: {
    minNodeVersion: string;
    minNpmVersion: string;
    supportedFrameworks: string[];
  };
}

// ============================================================================
// TEMPLATE MANIFEST
// ============================================================================

export interface TemplateManifest {
  version: string;
  entities: string[];
  events: string[];
  dependencies: string[];
  complexity: TemplateComplexity;
  requirements: {
    nodeVersion?: string;
    npmVersion?: string;
    frameworks?: string[];
    databases?: string[];
    services?: string[];
  };
  features: string[];
  screenshots: string[];
  demoUrl?: string;
  documentationUrl?: string;
  supportUrl?: string;
  license: string;
  author: {
    name: string;
    email: string;
    website?: string;
    github?: string;
  };
}

// ============================================================================
// TEMPLATE PREVIEW
// ============================================================================

export interface TemplatePreview {
  demoUrl: string;
  codeUrl: string;
  features: string[];
  livePreview?: boolean;
  interactiveDemo?: boolean;
  videoPreview?: string;
  documentation?: string;
}

// ============================================================================
// TEMPLATE PRICING
// ============================================================================

export interface TemplatePricing {
  type: PricingType;
  price?: number;
  currency?: string;
  subscription?: {
    interval: 'monthly' | 'yearly';
    price: number;
  };
  features: string[];
  limitations?: string[];
  trialDays?: number;
}

// ============================================================================
// TEMPLATE STATISTICS
// ============================================================================

export interface TemplateStats {
  views: number;
  likes: number;
  forks: number;
  comments: number;
  downloads: number;
  rating: number;
  totalRatings: number;
  lastUpdated: number;
  trendingScore: number;
  communityScore: number;
}

// ============================================================================
// USER PROFILE
// ============================================================================

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  verified: boolean;
  reputation: number;
  joinDate: number;
  preferences: {
    categories: TemplateCategory[];
    complexity: TemplateComplexity[];
    pricing: PricingType[];
  };
  history: {
    viewedTemplates: string[];
    installedTemplates: string[];
    likedTemplates: string[];
    ratedTemplates: Record<string, number>;
  };
  collections: UserCollection[];
}

// ============================================================================
// USER COLLECTIONS
// ============================================================================

export interface UserCollection {
  id: string;
  name: string;
  description?: string;
  templates: string[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  coverImage?: string;
}

// ============================================================================
// TEMPLATE AUTHOR
// ============================================================================

export interface TemplateAuthor {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  reputation: number;
  website?: string;
  github?: string;
  twitter?: string;
  bio?: string;
  templates: string[];
  followers: number;
  following: number;
}

// ============================================================================
// MAIN TEMPLATE INTERFACE
// ============================================================================

export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  author: TemplateAuthor;
  thumbnail: string;
  screenshots: string[];
  tags: string[];
  rating: number;
  totalRatings: number;
  downloads: number;
  createdAt: number;
  updatedAt: number;
  manifest: TemplateManifest;
  preview: TemplatePreview;
  pricing: TemplatePricing;
  stats: TemplateStats;
  versions: TemplateVersion[];
  currentVersion: string;
  dependencies: Record<string, string>;
  requirements: {
    nodeVersion?: string;
    npmVersion?: string;
    frameworks?: string[];
    databases?: string[];
    services?: string[];
  };
  compatibility: {
    minNodeVersion: string;
    minNpmVersion: string;
    supportedFrameworks: string[];
  };
  security: {
    scanned: boolean;
    vulnerabilities: number;
    lastScan: number;
    trusted: boolean;
  };
  accessibility: {
    wcagCompliant: boolean;
    screenReaderFriendly: boolean;
    keyboardNavigable: boolean;
    colorContrast: 'pass' | 'fail' | 'unknown';
  };
}

// ============================================================================
// FILTERING & SEARCH
// ============================================================================

export interface TemplateFilter {
  category?: TemplateCategory;
  tags?: string[];
  complexity?: TemplateComplexity[];
  pricing?: PricingType[];
  rating?: number;
  downloads?: number;
  dateRange?: {
    start: number;
    end: number;
  };
  author?: string;
  features?: string[];
  dependencies?: string[];
  accessibility?: boolean;
  security?: boolean;
}

export interface SearchOptions {
  query: string;
  filters: TemplateFilter;
  sortBy: 'popular' | 'recent' | 'rating' | 'downloads' | 'trending' | 'name';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  includePrivate?: boolean;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export interface TemplateRecommendation {
  id: string;
  templateId: string;
  reason: string;
  confidence: number;
  type: RecommendationType;
  metadata?: Record<string, any>;
  expiresAt?: number;
}

// ============================================================================
// INSTALLATION
// ============================================================================

export interface TemplateInstallation {
  id: string;
  templateId: string;
  userId: string;
  version: string;
  status: 'pending' | 'installing' | 'completed' | 'failed';
  progress: number;
  startedAt: number;
  completedAt?: number;
  error?: string;
  dependencies: Record<string, string>;
  configuration: Record<string, any>;
  files: string[];
  size: number;
}

// ============================================================================
// RATINGS & REVIEWS
// ============================================================================

export interface TemplateRating {
  id: string;
  templateId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: number;
  updatedAt: number;
  helpful: number;
  reported: boolean;
  verified: boolean;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export interface TemplateError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  userId?: string;
  templateId?: string;
  context?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: TemplateError;
  meta?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface TemplatesResponse extends ApiResponse<AppTemplate[]> {
  recommendations?: TemplateRecommendation[];
  filters?: TemplateFilter;
  searchOptions?: SearchOptions;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface TemplateEvent {
  type: string;
  templateId: string;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface TemplateViewEvent extends TemplateEvent {
  type: 'template:viewed';
  duration?: number;
  source: 'search' | 'category' | 'recommendation' | 'collection';
}

export interface TemplatePreviewEvent extends TemplateEvent {
  type: 'template:previewed';
  duration: number;
  interactions: string[];
}

export interface TemplateInstallEvent extends TemplateEvent {
  type: 'template:installed';
  version: string;
  dependencies: Record<string, string>;
  success: boolean;
  error?: string;
}

export interface TemplateRateEvent extends TemplateEvent {
  type: 'template:rated';
  rating: number;
  review?: string;
}

// ============================================================================
// COMPARISON TYPES
// ============================================================================

export interface TemplateComparison {
  id: string;
  userId: string;
  templates: string[];
  createdAt: number;
  updatedAt: number;
  notes?: string;
  isPublic: boolean;
}

export interface ComparisonResult {
  features: Record<string, boolean[]>;
  dependencies: Record<string, string[]>;
  ratings: number[];
  downloads: number[];
  pricing: TemplatePricing[];
  complexity: TemplateComplexity[];
  accessibility: boolean[];
  security: boolean[];
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface TemplateAnalytics {
  templateId: string;
  views: number;
  uniqueViews: number;
  previews: number;
  installations: number;
  ratings: number;
  averageRating: number;
  downloads: number;
  likes: number;
  shares: number;
  timeSpent: number;
  bounceRate: number;
  conversionRate: number;
  period: {
    start: number;
    end: number;
  };
}

// ============================================================================
// CACHE TYPES
// ============================================================================

export interface TemplateCache {
  templates: Map<string, AppTemplate>;
  recommendations: Map<string, TemplateRecommendation[]>;
  userCollections: Map<string, UserCollection[]>;
  searchResults: Map<string, AppTemplate[]>;
  lastUpdated: number;
  expiresAt: number;
}

// ============================================================================
// OFFLINE SUPPORT
// ============================================================================

export interface OfflineData {
  templates: AppTemplate[];
  userProfile?: UserProfile;
  collections: UserCollection[];
  lastSync: number;
  pendingActions: {
    type: string;
    data: any;
    timestamp: number;
  }[];
}

// ============================================================================
// LOCALIZATION
// ============================================================================

export interface LocalizedStrings {
  search: string;
  filters: string;
  categories: string;
  tags: string;
  sortBy: string;
  viewMode: string;
  install: string;
  preview: string;
  rating: string;
  downloads: string;
  author: string;
  version: string;
  features: string;
  dependencies: string;
  requirements: string;
  compatibility: string;
  security: string;
  accessibility: string;
  loading: string;
  error: string;
  noResults: string;
  clearFilters: string;
  compare: string;
  collections: string;
  favorites: string;
  history: string;
  recommendations: string;
  trending: string;
  new: string;
  popular: string;
  recent: string;
  highestRated: string;
  mostDownloaded: string;
  free: string;
  premium: string;
  subscription: string;
  trial: string;
  buy: string;
  download: string;
  share: string;
  report: string;
  help: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  license: string;
  changelog: string;
  releaseNotes: string;
  breakingChanges: string;
  compatibility: string;
  requirements: string;
  features: string;
  screenshots: string;
  demo: string;
  documentation: string;
  support: string;
  community: string;
  forum: string;
  discord: string;
  github: string;
  twitter: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  decimalSeparator: string;
  thousandsSeparator: string;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  currencyDecimals: number;
  currencyRounding: 'up' | 'down' | 'nearest';
  currencyDisplay: 'symbol' | 'code' | 'name';
  currencyFormat: string;
  currencyParse: string;
  currencyValidate: string;
  currencyConvert: string;
  currencyRate: string;
  currencyUpdate: string;
  currencyCache: string;
  currencyExpiry: string;
  currencySource: string;
  currencyError: string;
  currencyLoading: string;
  currencySuccess: string;
  currencyFailed: string;
  currencyRetry: string;
  currencyCancel: string;
  currencyConfirm: string;
  currencyClear: string;
  currencyReset: string;
  currencySave: string;
  currencyDelete: string;
  currencyEdit: string;
  currencyAdd: string;
  currencyRemove: string;
  currencySelect: string;
  currencySearch: string;
  currencyFilter: string;
  currencySort: string;
  currencyView: string;
  currencyList: string;
  currencyGrid: string;
  currencyTable: string;
  currencyCard: string;
  currencyTile: string;
  currencyItem: string;
  currencyRow: string;
  currencyColumn: string;
  currencySection: string;
  currencyGroup: string;
  currencyCategory: string;
  currencyTag: string;
  currencyLabel: string;
  currencyTitle: string;
  currencyDescription: string;
  currencyNote: string;
  currencyHint: string;
  currencyHelp: string;
  currencyInfo: string;
  currencyWarning: string;
  currencyError: string;
  currencySuccess: string;
  currencyLoading: string;
  currencyEmpty: string;
  currencyNoData: string;
  currencyNoResults: string;
  currencyNotFound: string;
  currencyUnauthorized: string;
  currencyForbidden: string;
  currencyBadRequest: string;
  currencyServerError: string;
  currencyNetworkError: string;
  currencyTimeout: string;
  currencyOffline: string;
  currencyOnline: string;
  currencySync: string;
  currencyUpdate: string;
  currencyRefresh: string;
  currencyReload: string;
  currencyRestart: string;
  currencyReset: string;
  currencyClear: string;
  currencyDelete: string;
  currencyRemove: string;
  currencyArchive: string;
  currencyRestore: string;
  currencyDuplicate: string;
  currencyCopy: string;
  currencyPaste: string;
  currencyCut: string;
  currencyUndo: string;
  currencyRedo: string;
  currencySelectAll: string;
  currencyDeselectAll: string;
  currencyInvertSelection: string;
  currencyExpandAll: string;
  currencyCollapseAll: string;
  currencyShowAll: string;
  currencyHideAll: string;
  currencyEnableAll: string;
  currencyDisableAll: string;
  currencyActivateAll: string;
  currencyDeactivateAll: string;
  currencyStartAll: string;
  currencyStopAll: string;
  currencyPauseAll: string;
  currencyResumeAll: string;
  currencyRestartAll: string;
  currencyResetAll: string;
  currencyClearAll: string;
  currencyDeleteAll: string;
  currencyRemoveAll: string;
  currencyArchiveAll: string;
  currencyRestoreAll: string;
  currencyDuplicateAll: string;
  currencyCopyAll: string;
  currencyPasteAll: string;
  currencyCutAll: string;
  currencyUndoAll: string;
  currencyRedoAll: string;
  currencySelectNone: string;
  currencyDeselectNone: string;
  currencyInvertNone: string;
  currencyExpandNone: string;
  currencyCollapseNone: string;
  currencyShowNone: string;
  currencyHideNone: string;
  currencyEnableNone: string;
  currencyDisableNone: string;
  currencyActivateNone: string;
  currencyDeactivateNone: string;
  currencyStartNone: string;
  currencyStopNone: string;
  currencyPauseNone: string;
  currencyResumeNone: string;
  currencyRestartNone: string;
  currencyResetNone: string;
  currencyClearNone: string;
  currencyDeleteNone: string;
  currencyRemoveNone: string;
  currencyArchiveNone: string;
  currencyRestoreNone: string;
  currencyDuplicateNone: string;
  currencyCopyNone: string;
  currencyPasteNone: string;
  currencyCutNone: string;
  currencyUndoNone: string;
  currencyRedoNone: string;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  TemplateCategory,
  TemplateComplexity,
  PricingType,
  RecommendationType,
  TemplateVersion,
  TemplateManifest,
  TemplatePreview,
  TemplatePricing,
  TemplateStats,
  UserProfile,
  UserCollection,
  TemplateAuthor,
  AppTemplate,
  TemplateFilter,
  SearchOptions,
  TemplateRecommendation,
  TemplateInstallation,
  TemplateRating,
  TemplateError,
  ValidationError,
  ApiResponse,
  TemplatesResponse,
  TemplateEvent,
  TemplateViewEvent,
  TemplatePreviewEvent,
  TemplateInstallEvent,
  TemplateRateEvent,
  TemplateComparison,
  ComparisonResult,
  TemplateAnalytics,
  TemplateCache,
  OfflineData,
  LocalizedStrings,
};
