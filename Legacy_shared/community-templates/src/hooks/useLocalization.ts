/**
 * AI-BOS Community Templates - Localization Hook
 *
 * Comprehensive localization support for multi-language templates
 * with dynamic language switching and translation management.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '@aibos/shared/lib';

// Types
import type { LocalizedStrings } from '../types';

// ============================================================================
// LOCALIZATION TYPES
// ============================================================================

export interface LocalizationOptions {
  /** Default language code */
  defaultLanguage?: string;
  /** Supported languages */
  supportedLanguages?: string[];
  /** Fallback language */
  fallbackLanguage?: string;
  /** Enable auto-detection */
  autoDetect?: boolean;
  /** Persist language preference */
  persistLanguage?: boolean;
  /** Custom translations */
  translations?: Record<string, LocalizedStrings>;
  /** Translation API endpoint */
  translationApi?: string;
  /** Enable dynamic loading */
  enableDynamicLoading?: boolean;
}

export interface LocalizationResult {
  /** Current language */
  language: string;
  /** Available languages */
  availableLanguages: string[];
  /** Current translations */
  t: (key: keyof LocalizedStrings, params?: Record<string, any>) => string;
  /** Change language */
  changeLanguage: (language: string) => Promise<void>;
  /** Load language */
  loadLanguage: (language: string) => Promise<void>;
  /** Get language info */
  getLanguageInfo: (language: string) => LanguageInfo;
  /** Format number */
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  /** Format date */
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  /** Format currency */
  formatCurrency: (amount: number, currency?: string) => string;
  /** Is language loaded */
  isLanguageLoaded: (language: string) => boolean;
  /** Loading status */
  isLoading: boolean;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currency: string;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandsSeparator: string;
}

// ============================================================================
// LANGUAGE CONFIGURATIONS
// ============================================================================

const DEFAULT_LANGUAGES: Record<string, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: '1,234.56',
    currency: 'USD',
    currencySymbol: '$',
    currencyPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: '1.234,56',
    currency: 'EUR',
    currencySymbol: '€',
    currencyPosition: 'after',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: '1 234,56',
    currency: 'EUR',
    currencySymbol: '€',
    currencyPosition: 'after',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    numberFormat: '1.234,56',
    currency: 'EUR',
    currencySymbol: '€',
    currencyPosition: 'after',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm',
    numberFormat: '1,234.56',
    currency: 'JPY',
    currencySymbol: '¥',
    currencyPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm',
    numberFormat: '1,234.56',
    currency: 'CNY',
    currencySymbol: '¥',
    currencyPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    numberFormat: '١٬٢٣٤٫٥٦',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    currencyPosition: 'after',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
};

// ============================================================================
// DEFAULT TRANSLATIONS
// ============================================================================

const DEFAULT_TRANSLATIONS: Record<string, LocalizedStrings> = {
  en: {
    search: 'Search',
    filters: 'Filters',
    categories: 'Categories',
    tags: 'Tags',
    sortBy: 'Sort by',
    viewMode: 'View mode',
    install: 'Install',
    preview: 'Preview',
    rating: 'Rating',
    downloads: 'Downloads',
    author: 'Author',
    version: 'Version',
    features: 'Features',
    dependencies: 'Dependencies',
    requirements: 'Requirements',
    compatibility: 'Compatibility',
    security: 'Security',
    accessibility: 'Accessibility',
    loading: 'Loading...',
    error: 'Error',
    noResults: 'No results found',
    clearFilters: 'Clear filters',
    compare: 'Compare',
    collections: 'Collections',
    favorites: 'Favorites',
    history: 'History',
    recommendations: 'Recommendations',
    trending: 'Trending',
    new: 'New',
    popular: 'Popular',
    recent: 'Recent',
    highestRated: 'Highest rated',
    mostDownloaded: 'Most downloaded',
    free: 'Free',
    premium: 'Premium',
    subscription: 'Subscription',
    trial: 'Trial',
    buy: 'Buy',
    download: 'Download',
    share: 'Share',
    report: 'Report',
    help: 'Help',
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy',
    terms: 'Terms',
    license: 'License',
    changelog: 'Changelog',
    releaseNotes: 'Release notes',
    breakingChanges: 'Breaking changes',
    requirements: 'Requirements',
    features: 'Features',
    screenshots: 'Screenshots',
    demo: 'Demo',
    documentation: 'Documentation',
    support: 'Support',
    community: 'Community',
    forum: 'Forum',
    discord: 'Discord',
    github: 'GitHub',
    twitter: 'Twitter',
    website: 'Website',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    country: 'Country',
    language: 'Language',
    currency: 'Currency',
    timezone: 'Timezone',
    dateFormat: 'Date format',
    timeFormat: 'Time format',
    numberFormat: 'Number format',
    decimalSeparator: 'Decimal separator',
    thousandsSeparator: 'Thousands separator',
    currencySymbol: 'Currency symbol',
    currencyPosition: 'Currency position',
    currencyDecimals: 'Currency decimals',
    currencyRounding: 'Currency rounding',
    currencyDisplay: 'Currency display',
    currencyFormat: 'Currency format',
    currencyParse: 'Currency parse',
    currencyValidate: 'Currency validate',
    currencyConvert: 'Currency convert',
    currencyRate: 'Currency rate',
    currencyUpdate: 'Currency update',
    currencyCache: 'Currency cache',
    currencyExpiry: 'Currency expiry',
    currencySource: 'Currency source',
    currencyError: 'Currency error',
    currencyLoading: 'Currency loading',
    currencySuccess: 'Currency success',
    currencyFailed: 'Currency failed',
    currencyRetry: 'Currency retry',
    currencyCancel: 'Currency cancel',
    currencyConfirm: 'Currency confirm',
    currencyClear: 'Currency clear',
    currencyReset: 'Currency reset',
    currencySave: 'Currency save',
    currencyDelete: 'Currency delete',
    currencyEdit: 'Currency edit',
    currencyAdd: 'Currency add',
    currencyRemove: 'Currency remove',
    currencySelect: 'Currency select',
    currencySearch: 'Currency search',
    currencyFilter: 'Currency filter',
    currencySort: 'Currency sort',
    currencyView: 'Currency view',
    currencyList: 'Currency list',
    currencyGrid: 'Currency grid',
    currencyTable: 'Currency table',
    currencyCard: 'Currency card',
    currencyTile: 'Currency tile',
    currencyItem: 'Currency item',
    currencyRow: 'Currency row',
    currencyColumn: 'Currency column',
    currencySection: 'Currency section',
    currencyGroup: 'Currency group',
    currencyCategory: 'Currency category',
    currencyTag: 'Currency tag',
    currencyLabel: 'Currency label',
    currencyTitle: 'Currency title',
    currencyDescription: 'Currency description',
    currencyNote: 'Currency note',
    currencyHint: 'Currency hint',
    currencyHelp: 'Currency help',
    currencyInfo: 'Currency info',
    currencyWarning: 'Currency warning',
    currencyError: 'Currency error',
    currencySuccess: 'Currency success',
    currencyLoading: 'Currency loading',
    currencyEmpty: 'Currency empty',
    currencyNoData: 'Currency no data',
    currencyNoResults: 'Currency no results',
    currencyNotFound: 'Currency not found',
    currencyUnauthorized: 'Currency unauthorized',
    currencyForbidden: 'Currency forbidden',
    currencyBadRequest: 'Currency bad request',
    currencyServerError: 'Currency server error',
    currencyNetworkError: 'Currency network error',
    currencyTimeout: 'Currency timeout',
    currencyOffline: 'Currency offline',
    currencyOnline: 'Currency online',
    currencySync: 'Currency sync',
    currencyUpdate: 'Currency update',
    currencyRefresh: 'Currency refresh',
    currencyReload: 'Currency reload',
    currencyRestart: 'Currency restart',
    currencyReset: 'Currency reset',
    currencyClear: 'Currency clear',
    currencyDelete: 'Currency delete',
    currencyRemove: 'Currency remove',
    currencyArchive: 'Currency archive',
    currencyRestore: 'Currency restore',
    currencyDuplicate: 'Currency duplicate',
    currencyCopy: 'Currency copy',
    currencyPaste: 'Currency paste',
    currencyCut: 'Currency cut',
    currencyUndo: 'Currency undo',
    currencyRedo: 'Currency redo',
    currencySelectAll: 'Currency select all',
    currencyDeselectAll: 'Currency deselect all',
    currencyInvertSelection: 'Currency invert selection',
    currencyExpandAll: 'Currency expand all',
    currencyCollapseAll: 'Currency collapse all',
    currencyShowAll: 'Currency show all',
    currencyHideAll: 'Currency hide all',
    currencyEnableAll: 'Currency enable all',
    currencyDisableAll: 'Currency disable all',
    currencyActivateAll: 'Currency activate all',
    currencyDeactivateAll: 'Currency deactivate all',
    currencyStartAll: 'Currency start all',
    currencyStopAll: 'Currency stop all',
    currencyPauseAll: 'Currency pause all',
    currencyResumeAll: 'Currency resume all',
    currencyRestartAll: 'Currency restart all',
    currencyResetAll: 'Currency reset all',
    currencyClearAll: 'Currency clear all',
    currencyDeleteAll: 'Currency delete all',
    currencyRemoveAll: 'Currency remove all',
    currencyArchiveAll: 'Currency archive all',
    currencyRestoreAll: 'Currency restore all',
    currencyDuplicateAll: 'Currency duplicate all',
    currencyCopyAll: 'Currency copy all',
    currencyPasteAll: 'Currency paste all',
    currencyCutAll: 'Currency cut all',
    currencyUndoAll: 'Currency undo all',
    currencyRedoAll: 'Currency redo all',
    currencySelectNone: 'Currency select none',
    currencyDeselectNone: 'Currency deselect none',
    currencyInvertNone: 'Currency invert none',
    currencyExpandNone: 'Currency expand none',
    currencyCollapseNone: 'Currency collapse none',
    currencyShowNone: 'Currency show none',
    currencyHideNone: 'Currency hide none',
    currencyEnableNone: 'Currency enable none',
    currencyDisableNone: 'Currency disable none',
    currencyActivateNone: 'Currency activate none',
    currencyDeactivateNone: 'Currency deactivate none',
    currencyStartNone: 'Currency start none',
    currencyStopNone: 'Currency stop none',
    currencyPauseNone: 'Currency pause none',
    currencyResumeNone: 'Currency resume none',
    currencyRestartNone: 'Currency restart none',
    currencyResetNone: 'Currency reset none',
    currencyClearNone: 'Currency clear none',
    currencyDeleteNone: 'Currency delete none',
    currencyRemoveNone: 'Currency remove none',
    currencyArchiveNone: 'Currency archive none',
    currencyRestoreNone: 'Currency restore none',
    currencyDuplicateNone: 'Currency duplicate none',
    currencyCopyNone: 'Currency copy none',
    currencyPasteNone: 'Currency paste none',
    currencyCutNone: 'Currency cut none',
    currencyUndoNone: 'Currency undo none',
    currencyRedoNone: 'Currency redo none',
  },
};

// ============================================================================
// LOCALIZATION HOOK
// ============================================================================

/**
 * Localization hook for multi-language support
 */
export function useLocalization(options: LocalizationOptions = {}): LocalizationResult {
  const {
    defaultLanguage = 'en',
    supportedLanguages = Object.keys(DEFAULT_LANGUAGES),
    fallbackLanguage = 'en',
    autoDetect = true,
    persistLanguage = true,
    translations = DEFAULT_TRANSLATIONS,
    translationApi,
    enableDynamicLoading = false,
  } = options;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [language, setLanguage] = useState(defaultLanguage);
  const [loadedLanguages, setLoadedLanguages] = useState<Set<string>>(new Set([defaultLanguage]));
  const [isLoading, setIsLoading] = useState(false);
  const [currentTranslations, setCurrentTranslations] = useState<LocalizedStrings>(
    translations[defaultLanguage] || DEFAULT_TRANSLATIONS[defaultLanguage],
  );

  // ============================================================================
  // LANGUAGE DETECTION
  // ============================================================================

  /**
   * Detect user's preferred language
   */
  const detectLanguage = useCallback((): string => {
    if (!autoDetect) return defaultLanguage;

    // Check localStorage first
    if (persistLanguage) {
      const saved = localStorage.getItem('aibos_language');
      if (saved && supportedLanguages.includes(saved)) {
        return saved;
      }
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (supportedLanguages.includes(browserLang)) {
      return browserLang;
    }

    // Check browser languages
    for (const lang of navigator.languages) {
      const code = lang.split('-')[0];
      if (supportedLanguages.includes(code)) {
        return code;
      }
    }

    return defaultLanguage;
  }, [autoDetect, defaultLanguage, persistLanguage, supportedLanguages]);

  // ============================================================================
  // TRANSLATION FUNCTIONS
  // ============================================================================

  /**
   * Translate key with parameters
   */
  const t = useCallback(
    (key: keyof LocalizedStrings, params?: Record<string, any>): string => {
      const translation = currentTranslations[key] || key;

      if (!params) return translation;

      return translation.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] !== undefined ? String(params[param]) : match;
      });
    },
    [currentTranslations],
  );

  /**
   * Load language dynamically
   */
  const loadLanguage = useCallback(
    async (lang: string): Promise<void> => {
      if (!enableDynamicLoading || loadedLanguages.has(lang)) return;

      setIsLoading(true);

      try {
        if (translationApi) {
          const response = await fetch(`${translationApi}/${lang}.json`);
          if (response.ok) {
            const translations = await response.json();
            setCurrentTranslations((prev) => ({ ...prev, ...translations }));
            setLoadedLanguages((prev) => new Set([...prev, lang]));
            logger.info('Language loaded dynamically', { language: lang });
          }
        }
      } catch (error) {
        logger.error('Failed to load language', { language: lang, error });
      } finally {
        setIsLoading(false);
      }
    },
    [enableDynamicLoading, loadedLanguages, translationApi],
  );

  /**
   * Change language
   */
  const changeLanguage = useCallback(
    async (lang: string): Promise<void> => {
      if (!supportedLanguages.includes(lang)) {
        logger.warn('Unsupported language', { language: lang });
        return;
      }

      setIsLoading(true);

      try {
        // Load language if not loaded
        if (!loadedLanguages.has(lang)) {
          await loadLanguage(lang);
        }

        // Update current language
        setLanguage(lang);
        setCurrentTranslations(translations[lang] || DEFAULT_TRANSLATIONS[lang]);

        // Persist language preference
        if (persistLanguage) {
          localStorage.setItem('aibos_language', lang);
        }

        // Update document direction
        const langInfo = getLanguageInfo(lang);
        document.documentElement.dir = langInfo.direction;
        document.documentElement.lang = lang;

        logger.info('Language changed', { language: lang });
      } catch (error) {
        logger.error('Failed to change language', { language: lang, error });
      } finally {
        setIsLoading(false);
      }
    },
    [supportedLanguages, loadedLanguages, loadLanguage, persistLanguage, translations],
  );

  // ============================================================================
  // FORMATTING FUNCTIONS
  // ============================================================================

  /**
   * Format number
   */
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      const langInfo = getLanguageInfo(language);

      return new Intl.NumberFormat(language, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...options,
      }).format(value);
    },
    [language],
  );

  /**
   * Format date
   */
  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      return new Intl.DateTimeFormat(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      }).format(date);
    },
    [language],
  );

  /**
   * Format currency
   */
  const formatCurrency = useCallback(
    (amount: number, currency?: string): string => {
      const langInfo = getLanguageInfo(language);
      const currencyCode = currency || langInfo.currency;

      return new Intl.NumberFormat(language, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    },
    [language],
  );

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Get language info
   */
  const getLanguageInfo = useCallback(
    (lang: string): LanguageInfo => {
      return DEFAULT_LANGUAGES[lang] || DEFAULT_LANGUAGES[fallbackLanguage];
    },
    [fallbackLanguage],
  );

  /**
   * Check if language is loaded
   */
  const isLanguageLoaded = useCallback(
    (lang: string): boolean => {
      return loadedLanguages.has(lang);
    },
    [loadedLanguages],
  );

  /**
   * Get available languages
   */
  const availableLanguages = useMemo(() => {
    return supportedLanguages.map((code) => ({
      code,
      ...getLanguageInfo(code),
    }));
  }, [supportedLanguages, getLanguageInfo]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initialize localization
   */
  useEffect(() => {
    const detectedLang = detectLanguage();
    if (detectedLang !== language) {
      changeLanguage(detectedLang);
    }
  }, [detectLanguage, language, changeLanguage]);

  /**
   * Preload fallback language
   */
  useEffect(() => {
    if (fallbackLanguage !== language && !loadedLanguages.has(fallbackLanguage)) {
      loadLanguage(fallbackLanguage);
    }
  }, [fallbackLanguage, language, loadedLanguages, loadLanguage]);

  // ============================================================================
  // RETURN RESULT
  // ============================================================================

  return {
    language,
    availableLanguages: supportedLanguages,
    t,
    changeLanguage,
    loadLanguage,
    getLanguageInfo,
    formatNumber,
    formatDate,
    formatCurrency,
    isLanguageLoaded,
    isLoading,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useLocalization;
