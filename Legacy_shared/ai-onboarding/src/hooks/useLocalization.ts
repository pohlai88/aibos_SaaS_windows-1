/**
 * useLocalization Hook
 *
 * Provides multi-language support including:
 * - i18n translation functionality
 * - Language detection and switching
 * - Date and number formatting
 * - RTL language support
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '@aibos/shared/lib';

export interface LocalizationData {
  [language: string]: {
    [key: string]: string | LocalizationData;
  };
}

export interface LocalizationConfig {
  defaultLanguage: string;
  supportedLanguages: string[];
  localizationData: LocalizationData;
  fallbackLanguage?: string;
  detectLanguage?: boolean;
  persistLanguage?: boolean;
}

export interface LocalizationContext {
  t: (key: string, params?: Record<string, any>) => string;
  currentLocale: string;
  changeLanguage: (language: string) => void;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  isRTL: boolean;
  supportedLanguages: string[];
}

// Default localization data
const defaultLocalizationData: LocalizationData = {
  en: {
    welcome: {
      'title': 'Welcome to AI-BOS!',
      'description':
        "I'm your AI assistant, here to help you learn app development step by step. Let's create a personalized learning path just for you!",
      'welcome-back': 'Welcome back, {name}! Ready to continue your journey?',
      'no-account': "No account needed - let's get started right away!",
      'start-journey': 'Start Your Journey',
      'setup-time': 'Takes about 5 minutes to set up your personalized path',
    },
    goals: {
      'title': 'What would you like to achieve?',
      'description':
        "Select your learning goals. I'll create a personalized path to help you reach them.",
      'build-first-app': {
        title: 'Build My First App',
        description: 'Create a complete working application from scratch',
      },
      'master-visual-builder': {
        title: 'Master Visual Builder',
        description: 'Become proficient with drag-and-drop app creation',
      },
      'understand-data': {
        title: 'Understand Data Management',
        description: 'Learn how to store, retrieve, and manage app data',
      },
      'advanced-features': {
        title: 'Add Advanced Features',
        description: 'Implement complex functionality and integrations',
      },
      'business-apps': {
        title: 'Create Business Apps',
        description: 'Build professional applications for business use',
      },
      'select': 'Select goal',
      'selected': 'Selected {goal}',
      'deselected': 'Deselected {goal}',
      'skills': 'Skills',
      'more': 'more',
      'create-path': 'Create My Learning Path',
      'selected-count': '{count} goals selected',
    },
    difficulty: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    path: {
      'personalized-title': 'Your Personalized Journey: {goals}',
      'personalized-description': 'AI-curated learning path based on your skills and goals',
      'basic-title': 'Basic Learning Path',
      'basic-description': 'A foundational path to get you started',
      'generation-complete': 'Learning path generated successfully',
      'not-generated': 'Learning path not yet generated',
    },
    modules: {
      'getting-started': {
        title: 'Getting Started with Visual Development',
        description: 'Learn the basics of drag-and-drop app building',
      },
      'building-components': {
        title: 'Building Your First Component',
        description: 'Create interactive components with properties and events',
      },
      'data-logic': {
        title: 'Data and Logic',
        description: 'Add data management and business logic to your apps',
      },
      'review': {
        title: 'Review and Refresh',
        description: 'Review key concepts before moving forward',
      },
    },
    recommendations: {
      'quick-start': {
        title: 'Quick Start: 5-Minute App',
        description: 'Build a simple app in just 5 minutes to get familiar with the interface',
        reason: 'Perfect for getting hands-on experience quickly',
      },
      'component-gallery': {
        title: 'Practice: Component Gallery',
        description: 'Explore all available components by building a showcase',
        reason: 'Helps you understand what components are available',
      },
    },
    assessment: {
      complete: 'Assessment completed successfully',
    },
    tutorial: {
      complete: 'Tutorial completed successfully',
    },
    offline: {
      'path-loaded': 'Learning path loaded from offline cache',
    },
    errors: {
      'path-generation-failed': 'Failed to generate learning path. Please try again.',
      'try-again': 'Try Again',
      'recovery-attempt': 'Attempting to recover with basic path',
    },
    navigation: {
      back: 'Back',
      settings: 'Settings',
      help: 'Help',
    },
    progress: {
      steps: 'Onboarding steps',
      step: 'step',
    },
    steps: {
      welcome: 'Welcome',
      assessment: 'Assessment',
      goals: 'Goals',
      path: 'Path',
    },
  },
  es: {
    welcome: {
      'title': '¡Bienvenido a AI-BOS!',
      'description':
        'Soy tu asistente de IA, aquí para ayudarte a aprender desarrollo de aplicaciones paso a paso. ¡Creemos un camino de aprendizaje personalizado solo para ti!',
      'welcome-back': '¡Bienvenido de vuelta, {name}! ¿Listo para continuar tu viaje?',
      'no-account': 'No se necesita cuenta - ¡comencemos de inmediato!',
      'start-journey': 'Comienza Tu Viaje',
      'setup-time': 'Toma unos 5 minutos configurar tu camino personalizado',
    },
    goals: {
      'title': '¿Qué te gustaría lograr?',
      'description':
        'Selecciona tus objetivos de aprendizaje. Crearé un camino personalizado para ayudarte a alcanzarlos.',
      'build-first-app': {
        title: 'Construir Mi Primera App',
        description: 'Crea una aplicación completa y funcional desde cero',
      },
      'master-visual-builder': {
        title: 'Dominar el Constructor Visual',
        description: 'Conviértete en experto en creación de apps con arrastrar y soltar',
      },
      'understand-data': {
        title: 'Entender la Gestión de Datos',
        description: 'Aprende cómo almacenar, recuperar y gestionar datos de apps',
      },
      'advanced-features': {
        title: 'Agregar Características Avanzadas',
        description: 'Implementa funcionalidad compleja e integraciones',
      },
      'business-apps': {
        title: 'Crear Apps de Negocio',
        description: 'Construye aplicaciones profesionales para uso empresarial',
      },
      'select': 'Seleccionar objetivo',
      'selected': 'Seleccionado {goal}',
      'deselected': 'Deseleccionado {goal}',
      'skills': 'Habilidades',
      'more': 'más',
      'create-path': 'Crear Mi Camino de Aprendizaje',
      'selected-count': '{count} objetivos seleccionados',
    },
    difficulty: {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
    },
    path: {
      'personalized-title': 'Tu Viaje Personalizado: {goals}',
      'personalized-description':
        'Camino de aprendizaje curado por IA basado en tus habilidades y objetivos',
      'basic-title': 'Camino de Aprendizaje Básico',
      'basic-description': 'Un camino fundamental para comenzar',
      'generation-complete': 'Camino de aprendizaje generado exitosamente',
      'not-generated': 'Camino de aprendizaje aún no generado',
    },
    modules: {
      'getting-started': {
        title: 'Comenzando con Desarrollo Visual',
        description: 'Aprende los conceptos básicos de construcción de apps con arrastrar y soltar',
      },
      'building-components': {
        title: 'Construyendo Tu Primer Componente',
        description: 'Crea componentes interactivos con propiedades y eventos',
      },
      'data-logic': {
        title: 'Datos y Lógica',
        description: 'Agrega gestión de datos y lógica de negocio a tus apps',
      },
      'review': {
        title: 'Revisar y Refrescar',
        description: 'Revisa conceptos clave antes de continuar',
      },
    },
    recommendations: {
      'quick-start': {
        title: 'Inicio Rápido: App de 5 Minutos',
        description:
          'Construye una app simple en solo 5 minutos para familiarizarte con la interfaz',
        reason: 'Perfecto para obtener experiencia práctica rápidamente',
      },
      'component-gallery': {
        title: 'Práctica: Galería de Componentes',
        description: 'Explora todos los componentes disponibles construyendo una muestra',
        reason: 'Te ayuda a entender qué componentes están disponibles',
      },
    },
    assessment: {
      complete: 'Evaluación completada exitosamente',
    },
    tutorial: {
      complete: 'Tutorial completado exitosamente',
    },
    offline: {
      'path-loaded': 'Camino de aprendizaje cargado desde caché offline',
    },
    errors: {
      'path-generation-failed':
        'Error al generar el camino de aprendizaje. Por favor, inténtalo de nuevo.',
      'try-again': 'Intentar de Nuevo',
      'recovery-attempt': 'Intentando recuperar con camino básico',
    },
    navigation: {
      back: 'Atrás',
      settings: 'Configuración',
      help: 'Ayuda',
    },
    progress: {
      steps: 'Pasos de incorporación',
      step: 'paso',
    },
    steps: {
      welcome: 'Bienvenida',
      assessment: 'Evaluación',
      goals: 'Objetivos',
      path: 'Camino',
    },
  },
};

export const useLocalization = (config: LocalizationConfig): LocalizationContext => {
  const [currentLocale, setCurrentLocale] = useState(config.defaultLanguage);
  const [localizationData, setLocalizationData] = useState<LocalizationData>({
    ...defaultLocalizationData,
    ...config.localizationData,
  });

  // ============================================================================
  // LANGUAGE DETECTION
  // ============================================================================

  const detectLanguage = useCallback(() => {
    if (!config.detectLanguage) return config.defaultLanguage;

    // Try to get language from localStorage
    const savedLanguage = localStorage.getItem('aibos-language');
    if (savedLanguage && config.supportedLanguages.includes(savedLanguage)) {
      return savedLanguage;
    }

    // Try to detect from browser
    const browserLanguage = navigator.language.split('-')[0];
    if (config.supportedLanguages.includes(browserLanguage)) {
      return browserLanguage;
    }

    // Fallback to default
    return config.fallbackLanguage || config.defaultLanguage;
  }, [config]);

  // ============================================================================
  // TRANSLATION FUNCTION
  // ============================================================================

  const t = useCallback(
    (key: string, params?: Record<string, any>): string => {
      try {
        // Split key by dots to navigate nested objects
        const keys = key.split('.');
        let value: any = localizationData[currentLocale];

        // Navigate through the nested structure
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            // Fallback to default language
            value = keys.reduce((obj, k) => obj?.[k], localizationData[config.defaultLanguage]);
            break;
          }
        }

        // If value is not found, return the key
        if (typeof value !== 'string') {
          logger.warn('Translation key not found', { key, locale: currentLocale });
          return key;
        }

        // Replace parameters in the string
        if (params) {
          return value.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? String(params[param]) : match;
          });
        }

        return value;
      } catch (error) {
        logger.error('Translation error', { key, error });
        return key;
      }
    },
    [currentLocale, localizationData, config.defaultLanguage],
  );

  // ============================================================================
  // LANGUAGE SWITCHING
  // ============================================================================

  const changeLanguage = useCallback(
    (language: string) => {
      if (!config.supportedLanguages.includes(language)) {
        logger.warn('Unsupported language', { language, supported: config.supportedLanguages });
        return;
      }

      setCurrentLocale(language);

      // Persist language preference
      if (config.persistLanguage) {
        localStorage.setItem('aibos-language', language);
      }

      // Update document direction for RTL languages
      document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
      document.documentElement.lang = language;

      logger.info('Language changed', { from: currentLocale, to: language });
    },
    [config.supportedLanguages, config.persistLanguage, currentLocale],
  );

  // ============================================================================
  // FORMATTING FUNCTIONS
  // ============================================================================

  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const defaultOptions: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          ...options,
        };

        return new Intl.DateTimeFormat(currentLocale, defaultOptions).format(date);
      } catch (error) {
        logger.error('Date formatting error', { error });
        return date.toLocaleDateString();
      }
    },
    [currentLocale],
  );

  const formatNumber = useCallback(
    (number: number, options?: Intl.NumberFormatOptions): string => {
      try {
        const defaultOptions: Intl.NumberFormatOptions = {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
          ...options,
        };

        return new Intl.NumberFormat(currentLocale, defaultOptions).format(number);
      } catch (error) {
        logger.error('Number formatting error', { error });
        return number.toString();
      }
    },
    [currentLocale],
  );

  const formatCurrency = useCallback(
    (amount: number, currency: string = 'USD'): string => {
      try {
        return new Intl.NumberFormat(currentLocale, {
          style: 'currency',
          currency,
        }).format(amount);
      } catch (error) {
        logger.error('Currency formatting error', { error });
        return `${currency} ${amount}`;
      }
    },
    [currentLocale],
  );

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const isRTL = useCallback((language: string): boolean => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ps', 'sd'];
    return rtlLanguages.includes(language);
  }, []);

  // Memoized RTL status
  const rtlStatus = useMemo(() => isRTL(currentLocale), [currentLocale, isRTL]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const detectedLanguage = detectLanguage();
    if (detectedLanguage !== currentLocale) {
      changeLanguage(detectedLanguage);
    }
  }, [detectLanguage, changeLanguage, currentLocale]);

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  return {
    t,
    currentLocale,
    changeLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
    isRTL: rtlStatus,
    supportedLanguages: config.supportedLanguages,
  };
};
