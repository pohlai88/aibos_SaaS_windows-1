'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Code, Eye, Copy, Download, Search, Filter,
  ChevronDown, ChevronRight, Play, Settings, Palette,
  Smartphone, Tablet, Monitor, Zap, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAIBOSStore } from '@/lib/store';

// ==================== TYPES ====================

interface ComponentExample {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  code: string;
  props: ComponentProp[];
  variants: ComponentVariant[];
  usage: string;
  accessibility: string[];
}

interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

interface ComponentVariant {
  name: string;
  description: string;
  props: Record<string, any>;
}

// ==================== COMPONENT LIBRARY APP ====================

const ComponentLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'showcase' | 'docs' | 'testing' | 'settings'>('showcase');
  const [selectedComponent, setSelectedComponent] = useState<ComponentExample | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCode, setShowCode] = useState(false);
  const [copiedComponent, setCopiedComponent] = useState<string | null>(null);

  const { addNotification } = useAIBOSStore();

  // ==================== COMPONENT EXAMPLES ====================

  const componentExamples: ComponentExample[] = [
    {
      id: 'button',
      name: 'Button',
      description: 'Versatile button component with multiple variants and states',
      category: 'primitives',
      tags: ['interactive', 'form', 'action'],
      code: `import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>`,
      props: [
        {
          name: 'variant',
          type: "'primary' | 'secondary' | 'danger' | 'ghost'",
          required: false,
          defaultValue: 'primary',
          description: 'Visual style variant of the button'
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          required: false,
          defaultValue: 'md',
          description: 'Size of the button'
        },
        {
          name: 'disabled',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the button is disabled'
        },
        {
          name: 'onClick',
          type: '() => void',
          required: false,
          description: 'Click handler function'
        }
      ],
      variants: [
        {
          name: 'Primary',
          description: 'Default primary button',
          props: { variant: 'primary' }
        },
        {
          name: 'Secondary',
          description: 'Secondary button style',
          props: { variant: 'secondary' }
        },
        {
          name: 'Danger',
          description: 'Danger/delete button',
          props: { variant: 'danger' }
        },
        {
          name: 'Ghost',
          description: 'Minimal ghost button',
          props: { variant: 'ghost' }
        }
      ],
      usage: `// Basic usage
<Button onClick={handleSave}>Save</Button>

// With variants
<Button variant="danger" onClick={handleDelete}>Delete</Button>

// Disabled state
<Button disabled>Processing...</Button>`,
      accessibility: [
        'Supports keyboard navigation',
        'ARIA labels for screen readers',
        'Focus indicators',
        'Color contrast compliance'
      ]
    },
    {
      id: 'input',
      name: 'Input',
      description: 'Form input component with validation and error states',
      category: 'form',
      tags: ['input', 'form', 'validation'],
      code: `import { Input } from '@/components/ui/Input';

<Input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={handleEmailChange}
  error={emailError}
/>`,
      props: [
        {
          name: 'type',
          type: 'string',
          required: false,
          defaultValue: 'text',
          description: 'HTML input type'
        },
        {
          name: 'placeholder',
          type: 'string',
          required: false,
          description: 'Placeholder text'
        },
        {
          name: 'value',
          type: 'string',
          required: true,
          description: 'Input value'
        },
        {
          name: 'onChange',
          type: '(value: string) => void',
          required: true,
          description: 'Change handler'
        },
        {
          name: 'error',
          type: 'string',
          required: false,
          description: 'Error message to display'
        }
      ],
      variants: [
        {
          name: 'Default',
          description: 'Standard input field',
          props: { type: 'text', placeholder: 'Enter text...' }
        },
        {
          name: 'Email',
          description: 'Email input with validation',
          props: { type: 'email', placeholder: 'Enter email...' }
        },
        {
          name: 'Password',
          description: 'Password input with toggle',
          props: { type: 'password', placeholder: 'Enter password...' }
        },
        {
          name: 'With Error',
          description: 'Input with error state',
          props: { error: 'This field is required' }
        }
      ],
      usage: `// Basic input
<Input value={name} onChange={setName} placeholder="Name" />

// With validation
<Input
  type="email"
  value={email}
  onChange={setEmail}
  error={emailError}
  placeholder="Email"
/>`,
      accessibility: [
        'Proper label association',
        'Error announcement for screen readers',
        'Keyboard navigation support',
        'Focus management'
      ]
    },
    {
      id: 'card',
      name: 'Card',
      description: 'Container component for grouping related content',
      category: 'layout',
      tags: ['container', 'layout', 'content'],
      code: `import { Card } from '@/components/ui/Card';

<Card>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card description</Card.Description>
  </Card.Header>
  <Card.Content>
    Card content goes here
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>`,
      props: [
        {
          name: 'variant',
          type: "'default' | 'elevated' | 'outlined'",
          required: false,
          defaultValue: 'default',
          description: 'Visual style variant'
        },
        {
          name: 'padding',
          type: "'none' | 'sm' | 'md' | 'lg'",
          required: false,
          defaultValue: 'md',
          description: 'Internal padding size'
        }
      ],
      variants: [
        {
          name: 'Default',
          description: 'Standard card with shadow',
          props: { variant: 'default' }
        },
        {
          name: 'Elevated',
          description: 'Card with stronger shadow',
          props: { variant: 'elevated' }
        },
        {
          name: 'Outlined',
          description: 'Card with border only',
          props: { variant: 'outlined' }
        }
      ],
      usage: `// Basic card
<Card>
  <Card.Content>Simple content</Card.Content>
</Card>

// Full card with all sections
<Card>
  <Card.Header>
    <Card.Title>User Profile</Card.Title>
  </Card.Header>
  <Card.Content>
    <p>User information...</p>
  </Card.Content>
  <Card.Footer>
    <Button>Edit Profile</Button>
  </Card.Footer>
</Card>`,
      accessibility: [
        'Semantic HTML structure',
        'Proper heading hierarchy',
        'Landmark roles',
        'Focus management'
      ]
    },
    {
      id: 'modal',
      name: 'Modal',
      description: 'Overlay dialog component for focused interactions',
      category: 'overlay',
      tags: ['dialog', 'overlay', 'focus'],
      code: `import { Modal } from '@/components/ui/Modal';

<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>
    <Modal.Title>Confirm Action</Modal.Title>
  </Modal.Header>
  <Modal.Content>
    Are you sure you want to proceed?
  </Modal.Content>
  <Modal.Footer>
    <Button onClick={handleConfirm}>Confirm</Button>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
  </Modal.Footer>
</Modal>`,
      props: [
        {
          name: 'isOpen',
          type: 'boolean',
          required: true,
          description: 'Whether the modal is visible'
        },
        {
          name: 'onClose',
          type: '() => void',
          required: true,
          description: 'Function to close the modal'
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg' | 'xl'",
          required: false,
          defaultValue: 'md',
          description: 'Size of the modal'
        }
      ],
      variants: [
        {
          name: 'Small',
          description: 'Compact modal for simple content',
          props: { size: 'sm' }
        },
        {
          name: 'Medium',
          description: 'Standard modal size',
          props: { size: 'md' }
        },
        {
          name: 'Large',
          description: 'Large modal for complex content',
          props: { size: 'lg' }
        }
      ],
      usage: `// Basic modal
<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
  <Modal.Content>Hello World!</Modal.Content>
</Modal>

// Confirmation modal
<Modal isOpen={showConfirm} onClose={handleCancel}>
  <Modal.Header>
    <Modal.Title>Delete Item</Modal.Title>
  </Modal.Header>
  <Modal.Content>
    This action cannot be undone.
  </Modal.Content>
  <Modal.Footer>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
    <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
  </Modal.Footer>
</Modal>`,
      accessibility: [
        'Focus trapping',
        'Escape key handling',
        'ARIA dialog role',
        'Screen reader announcements'
      ]
    }
  ];

  // ==================== FILTERED COMPONENTS ====================

  const filteredComponents = componentExamples.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(componentExamples.map(c => c.category)))];

  // ==================== UTILITY FUNCTIONS ====================

  const copyToClipboard = useCallback(async (text: string, componentName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedComponent(componentName);
      setTimeout(() => setCopiedComponent(null), 2000);

      addNotification({
        type: 'success',
        title: 'Code Copied',
        message: `${componentName} code copied to clipboard`,
        isRead: false
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy code to clipboard',
        isRead: false
      });
    }
  }, [addNotification]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'primitives': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'form': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'layout': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'overlay': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Component Library</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reusable UI components with documentation and testing
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {viewMode === 'grid' ? <Monitor className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowCode(!showCode)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Code className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'showcase', label: 'Showcase', icon: Eye },
            { id: 'docs', label: 'Documentation', icon: Package },
            { id: 'testing', label: 'Testing', icon: Play },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'showcase' && (
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Components</h3>
                <div className="space-y-2">
                  {filteredComponents.map((component) => (
                    <motion.div
                      key={component.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedComponent?.id === component.id
                          ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700'
                          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedComponent(component)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{component.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(component.category)}`}>
                          {component.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {component.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {component.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {component.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                            +{component.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedComponent ? (
                <div className="p-6">
                  {/* Component Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{selectedComponent.name}</h2>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedComponent.category)}`}>
                            {selectedComponent.category}
                          </span>
                          <div className="flex space-x-2">
                            {selectedComponent.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(selectedComponent.code, selectedComponent.name)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span>{copiedComponent === selectedComponent.name ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{selectedComponent.description}</p>
                  </div>

                  {/* Component Preview */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Preview</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center min-h-32">
                        <div className="text-center">
                          <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-500 dark:text-gray-400">
                            Component preview for {selectedComponent.name}
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                            Interactive preview coming soon
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Code Example */}
                  {showCode && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Code Example</h3>
                      <div className="bg-gray-900 rounded-lg p-4">
                        <pre className="text-green-400 text-sm overflow-x-auto">
                          <code>{selectedComponent.code}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Variants */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Variants</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedComponent.variants.map((variant, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium mb-2">{variant.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {variant.description}
                          </p>
                          <div className="bg-gray-100 dark:bg-gray-700 rounded p-2">
                            <pre className="text-xs text-gray-700 dark:text-gray-300">
                              {JSON.stringify(variant.props, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Props Documentation */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Props</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Required</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Default</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedComponent.props.map((prop, index) => (
                            <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                              <td className="px-4 py-3 text-sm font-medium">{prop.name}</td>
                              <td className="px-4 py-3 text-sm font-mono text-purple-600 dark:text-purple-400">
                                {prop.type}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {prop.required ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {prop.defaultValue !== undefined ? String(prop.defaultValue) : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {prop.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Usage Examples */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-green-400 text-sm overflow-x-auto">
                        <code>{selectedComponent.usage}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Accessibility */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <ul className="space-y-2">
                        {selectedComponent.accessibility.map((item, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Select a Component</h3>
                    <p>Choose a component from the sidebar to view its documentation and examples</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Component Documentation</h2>
            <div className="prose dark:prose-invert max-w-none">
              <h3>Getting Started</h3>
              <p>The AI-BOS Component Library provides a comprehensive set of reusable UI components designed for enterprise applications.</p>

              <h3>Installation</h3>
              <p>Components are available through the shared infrastructure package:</p>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
{`npm install @aibos/shared-infrastructure`}
              </pre>

              <h3>Usage</h3>
              <p>Import components from the shared package:</p>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
{`import { Button, Input, Card } from '@aibos/shared-infrastructure';`}
              </pre>

              <h3>Design System</h3>
              <p>All components follow the AI-BOS design system with consistent spacing, colors, and typography.</p>

              <h3>Accessibility</h3>
              <p>Components are built with accessibility in mind, following WCAG 2.1 AA guidelines.</p>
            </div>
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Component Testing</h2>
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Interactive component testing environment coming soon.</p>
              <p className="text-sm mt-2">Test components with different props and viewports.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Component Library Settings</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Display Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show code by default</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically display code examples
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCode(!showCode)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        showCode ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        showCode ? 'transform translate-x-6' : 'transform translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Export Options</h3>
                <div className="space-y-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export Component Library</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Code className="w-4 h-4" />
                    <span>Generate TypeScript Types</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentLibrary;
