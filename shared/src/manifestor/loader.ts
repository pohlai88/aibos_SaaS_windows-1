import { SharedManifest, register } from './index';

// ==================== SHARED MANIFEST LOADER ====================

/**
 * Load all manifests from the shared manifests directory
 */
export async function loadSharedManifests(): Promise<void> {
  console.log('🧠 Loading AI-BOS shared manifests...');

  try {
    // Define manifest paths
    const manifestsDir = __dirname + '/../manifests';

    // Import manifests directly (since this is a package, we'll use static imports)
    const manifests: SharedManifest[] = [
      // Core system manifests
      {
        id: 'shared:design-system',
        version: '1.0.0',
        type: 'system',
        enabled: true,
        dependencies: [],
        permissions: {
          read: ['user', 'admin', 'system'],
          write: ['admin', 'system'],
          configure: ['admin', 'system'],
          customize: ['user', 'admin', 'system']
        },
        config: {
          defaults: {
            theme: 'auto',
            variant: 'default',
            animations: true,
            responsive: true,
            tokens: {
              colors: {
                primary: '#3B82F6',
                secondary: '#6B7280',
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                info: '#06B6D4'
              },
              spacing: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '3rem'
              },
              typography: {
                fontFamily: {
                  sans: 'Inter, system-ui, sans-serif',
                  mono: 'JetBrains Mono, monospace'
                },
                fontSize: {
                  xs: '0.75rem',
                  sm: '0.875rem',
                  base: '1rem',
                  lg: '1.125rem',
                  xl: '1.25rem',
                  '2xl': '1.5rem'
                },
                fontWeight: {
                  normal: '400',
                  medium: '500',
                  semibold: '600',
                  bold: '700'
                }
              },
              borderRadius: {
                sm: '0.25rem',
                md: '0.375rem',
                lg: '0.5rem',
                xl: '0.75rem',
                full: '9999px'
              },
              shadows: {
                sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }
            },
            components: {
              Button: {
                variants: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
                sizes: ['sm', 'md', 'lg'],
                loading: true,
                disabled: true
              },
              Input: {
                variants: ['default', 'error', 'success'],
                sizes: ['sm', 'md', 'lg'],
                types: ['text', 'email', 'password', 'number', 'search']
              },
              Card: {
                variants: ['default', 'elevated', 'outlined'],
                padding: ['sm', 'md', 'lg']
              },
              Modal: {
                sizes: ['sm', 'md', 'lg', 'xl'],
                backdrop: true,
                closeOnEscape: true,
                closeOnOverlayClick: true
              }
            }
          },
          overrides: {
            development: {
              animations: false,
              debug: true
            },
            production: {
              animations: true,
              debug: false
            }
          }
        },
        features: {
          darkMode: true,
          customThemes: true,
          animations: true,
          responsive: true,
          customization: true,
          tokens: true,
          components: true,
          icons: true,
          typography: true
        },
        design: {
          theme: 'auto',
          variant: 'default',
          animations: true
        },
        performance: {
          lazy: true,
          cache: true,
          optimize: true,
          bundle: true
        },
        security: {
          validate: true,
          sanitize: true,
          encrypt: false,
          audit: true
        }
      },
      // Utility manifests
      {
        id: 'shared:utilities',
        version: '1.0.0',
        type: 'utility',
        enabled: true,
        dependencies: ['shared:design-system'],
        permissions: {
          read: ['user', 'admin', 'system'],
          write: ['admin', 'system'],
          execute: ['user', 'admin', 'system'],
          configure: ['admin', 'system']
        },
        config: {
          defaults: {
            validation: {
              strict: true,
              sanitize: true,
              transform: true
            },
            formatting: {
              dateFormat: 'ISO',
              numberFormat: 'en-US',
              currencyFormat: 'USD'
            },
            caching: {
              enabled: true,
              ttl: 300000,
              maxSize: 1000
            },
            logging: {
              level: 'info',
              format: 'json',
              transports: ['console']
            },
            security: {
              encryption: false,
              hashing: true,
              sanitization: true
            },
            performance: {
              debounce: 300,
              throttle: 100,
              memoization: true
            },
            functions: {
              validation: {
                email: true,
                phone: true,
                url: true,
                uuid: true,
                password: true
              },
              formatting: {
                date: true,
                number: true,
                currency: true,
                phone: true,
                creditCard: true
              },
              caching: {
                memory: true,
                localStorage: true,
                sessionStorage: true
              },
              logging: {
                console: true,
                file: false,
                remote: false
              },
              security: {
                hash: true,
                encrypt: false,
                sanitize: true,
                validate: true
              },
              performance: {
                debounce: true,
                throttle: true,
                memoize: true,
                lazy: true
              }
            }
          },
          overrides: {
            development: {
              validation: {
                strict: false
              },
              logging: {
                level: 'debug'
              },
              caching: {
                ttl: 60000
              }
            },
            production: {
              validation: {
                strict: true
              },
              logging: {
                level: 'warn'
              },
              caching: {
                ttl: 600000
              }
            }
          }
        },
        features: {
          validation: true,
          formatting: true,
          caching: true,
          logging: true,
          security: true,
          performance: true,
          helpers: true,
          transformers: true,
          sanitizers: true,
          validators: true
        },
        design: {
          theme: 'auto',
          variant: 'default',
          animations: false
        },
        performance: {
          lazy: true,
          cache: true,
          optimize: true,
          bundle: true
        },
        security: {
          validate: true,
          sanitize: true,
          encrypt: false,
          audit: true
        }
      },
      // Component manifests
      {
        id: 'shared:components',
        version: '1.0.0',
        type: 'component',
        enabled: true,
        dependencies: ['shared:design-system', 'shared:utilities'],
        permissions: {
          read: ['user', 'admin', 'system'],
          write: ['admin', 'system'],
          render: ['user', 'admin', 'system'],
          customize: ['user', 'admin', 'system'],
          configure: ['admin', 'system']
        },
        config: {
          defaults: {
            theme: 'auto',
            variant: 'default',
            animations: true,
            responsive: true,
            components: {
              Button: {
                enabled: true,
                variants: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
                sizes: ['sm', 'md', 'lg'],
                features: {
                  loading: true,
                  disabled: true,
                  icon: true,
                  badge: true
                }
              },
              Input: {
                enabled: true,
                variants: ['default', 'error', 'success', 'warning'],
                sizes: ['sm', 'md', 'lg'],
                types: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
                features: {
                  validation: true,
                  masking: true,
                  autocomplete: true,
                  clearable: true
                }
              },
              Card: {
                enabled: true,
                variants: ['default', 'elevated', 'outlined', 'interactive'],
                padding: ['sm', 'md', 'lg', 'xl'],
                features: {
                  header: true,
                  footer: true,
                  actions: true,
                  loading: true
                }
              },
              Modal: {
                enabled: true,
                sizes: ['sm', 'md', 'lg', 'xl', 'full'],
                features: {
                  backdrop: true,
                  closeOnEscape: true,
                  closeOnOverlayClick: true,
                  draggable: false,
                  resizable: false
                }
              },
              Table: {
                enabled: true,
                features: {
                  sorting: true,
                  filtering: true,
                  pagination: true,
                  selection: true,
                  virtualization: true
                }
              },
              Form: {
                enabled: true,
                features: {
                  validation: true,
                  autoSave: true,
                  dirtyTracking: true,
                  fieldArrays: true
                }
              },
              Navigation: {
                enabled: true,
                types: ['tabs', 'breadcrumbs', 'pagination', 'menu'],
                features: {
                  responsive: true,
                  keyboard: true
                }
              },
              Feedback: {
                enabled: true,
                types: ['toast', 'alert', 'progress', 'skeleton'],
                features: {
                  autoDismiss: true,
                  stacking: true,
                  positioning: true
                }
              }
            },
            performance: {
              lazyLoading: true,
              codeSplitting: true,
              memoization: true,
              virtualization: true
            },
            accessibility: {
              ariaLabels: true,
              keyboardNavigation: true,
              screenReader: true,
              focusManagement: true,
              colorContrast: true
            }
          },
          overrides: {
            development: {
              animations: false,
              performance: {
                lazyLoading: false,
                virtualization: false
              },
              debug: true
            },
            production: {
              animations: true,
              performance: {
                lazyLoading: true,
                virtualization: true
              },
              debug: false
            }
          }
        },
        features: {
          components: true,
          theming: true,
          animations: true,
          responsive: true,
          performance: true,
          customization: true,
          validation: true,
          feedback: true,
          navigation: true
        },
        design: {
          theme: 'auto',
          variant: 'default',
          animations: true
        },
        security: {
          validate: true,
          sanitize: true,
          encrypt: false,
          audit: true
        }
      }
    ];

    // Sort by dependencies (system first, then utility, then component)
    const sorted = sortByDependencies(manifests);

    // Register each manifest
    for (const manifest of sorted) {
      try {
        register(manifest);
      } catch (error) {
        console.error(`Failed to register shared manifest ${manifest.id}:`, error);
      }
    }

    console.log(`✅ Loaded ${sorted.length} shared manifests`);
  } catch (error) {
    console.error('Failed to load shared manifests:', error);
    throw error;
  }
}

/**
 * Sort manifests by dependencies
 */
function sortByDependencies(manifests: SharedManifest[]): SharedManifest[] {
  const sorted: SharedManifest[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(manifest: SharedManifest) {
    if (visiting.has(manifest.id)) {
      throw new Error(`Circular dependency detected: ${manifest.id}`);
    }
    if (visited.has(manifest.id)) {
      return;
    }

    visiting.add(manifest.id);

    // Visit dependencies first
    for (const depId of manifest.dependencies) {
      const dep = manifests.find(m => m.id === depId);
      if (dep) {
        visit(dep);
      }
    }

    visiting.delete(manifest.id);
    visited.add(manifest.id);
    sorted.push(manifest);
  }

  // Sort by type first (system, utility, component)
  const typeOrder = { system: 0, utility: 1, component: 2, integration: 3 };
  const typeSorted = manifests.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

  // Then sort by dependencies
  for (const manifest of typeSorted) {
    visit(manifest);
  }

  return sorted;
}

/**
 * Get manifest by ID
 */
export function getSharedManifest(id: string): SharedManifest | undefined {
  // This would need to be implemented with the actual manifest storage
  // For now, return undefined
  return undefined;
}

/**
 * Get all manifests
 */
export function getAllSharedManifests(): SharedManifest[] {
  // This would need to be implemented with the actual manifest storage
  // For now, return empty array
  return [];
}

/**
 * Initialize shared manifestor
 */
export function initializeSharedManifestor(): void {
  loadSharedManifests().catch(error => {
    console.error('Failed to initialize shared manifestor:', error);
  });
}
