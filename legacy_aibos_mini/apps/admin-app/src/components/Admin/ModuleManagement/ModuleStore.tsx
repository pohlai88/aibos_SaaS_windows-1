'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Select } from '@aibos/ui-components';
import { 
  Search, 
  Download, 
  Star, 
  Users, 
  Calendar,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { ModuleCategory, ModuleStatus } from '@aibos/module-registry';

interface ModuleCardProps {
  module: any;
  onInstall: (moduleId: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onInstall }) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
          <p className="text-sm text-gray-600">by {module.author}</p>
        </div>
        <Badge variant={module.status === 'published' ? 'success' : 'warning'}>
          {module.status}
        </Badge>
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-2">{module.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {module.tags.map((tag: string) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>{module.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{module.downloads}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(module.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          v{module.version}
        </div>
        <Button 
          onClick={() => onInstall(module.id)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Install
        </Button>
      </div>
    </Card>
  );
};

const ModuleStore: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [filteredModules, setFilteredModules] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockModules = [
      {
        id: 'advanced-reporting',
        name: 'Advanced Reporting',
        version: '1.2.0',
        description: 'Comprehensive reporting and analytics module with customizable dashboards and export capabilities.',
        author: 'AI-BOS Team',
        category: ModuleCategory.REPORTING,
        tags: ['reporting', 'analytics', 'dashboard'],
        status: ModuleStatus.PUBLISHED,
        rating: 4.8,
        downloads: 1250,
        updatedAt: new Date('2024-01-15'),
        requirements: {
          nodeVersion: '>=20.0.0',
          typescriptVersion: '>=5.3.0',
          aiBosVersion: '>=1.0.0'
        }
      },
      {
        id: 'invoice-automation',
        name: 'Invoice Automation',
        version: '2.1.0',
        description: 'Automated invoice processing with AI-powered data extraction and approval workflows.',
        author: 'AI-BOS Team',
        category: ModuleCategory.ACCOUNTING,
        tags: ['invoice', 'automation', 'ai'],
        status: ModuleStatus.PUBLISHED,
        rating: 4.9,
        downloads: 890,
        updatedAt: new Date('2024-01-10'),
        requirements: {
          nodeVersion: '>=20.0.0',
          typescriptVersion: '>=5.3.0',
          aiBosVersion: '>=1.0.0'
        }
      },
      {
        id: 'customer-portal',
        name: 'Customer Portal',
        version: '1.0.0',
        description: 'Self-service customer portal for account management and document access.',
        author: 'AI-BOS Team',
        category: ModuleCategory.CRM,
        tags: ['customer', 'portal', 'self-service'],
        status: ModuleStatus.PUBLISHED,
        rating: 4.7,
        downloads: 650,
        updatedAt: new Date('2024-01-05'),
        requirements: {
          nodeVersion: '>=20.0.0',
          typescriptVersion: '>=5.3.0',
          aiBosVersion: '>=1.0.0'
        }
      },
      {
        id: 'expense-management',
        name: 'Expense Management',
        version: '1.5.0',
        description: 'Complete expense tracking and approval system with receipt scanning and reimbursement workflows.',
        author: 'AI-BOS Team',
        category: ModuleCategory.HR,
        tags: ['expense', 'hr', 'approval'],
        status: ModuleStatus.PUBLISHED,
        rating: 4.6,
        downloads: 720,
        updatedAt: new Date('2024-01-12'),
        requirements: {
          nodeVersion: '>=20.0.0',
          typescriptVersion: '>=5.3.0',
          aiBosVersion: '>=1.0.0'
        }
      }
    ];
    
    setModules(mockModules);
    setFilteredModules(mockModules);
  }, []);

  // Filter modules based on search and category
  useEffect(() => {
    let filtered = modules;
    
    if (searchQuery) {
      filtered = filtered.filter(module =>
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(module => module.category === selectedCategory);
    }
    
    setFilteredModules(filtered);
  }, [modules, searchQuery, selectedCategory]);

  const handleInstall = async (moduleId: string) => {
    setInstalling(moduleId);
    setLoading(true);
    
    try {
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would call the actual installation API
      console.log(`Installing module: ${moduleId}`);
      
      // Show success message
      alert(`Module ${moduleId} installed successfully!`);
    } catch (error) {
      console.error('Installation failed:', error);
      alert('Installation failed. Please try again.');
    } finally {
      setInstalling(null);
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: ModuleCategory.ACCOUNTING, label: 'Accounting' },
    { value: ModuleCategory.CRM, label: 'CRM' },
    { value: ModuleCategory.HR, label: 'HR' },
    { value: ModuleCategory.WORKFLOW, label: 'Workflow' },
    { value: ModuleCategory.PROCUREMENT, label: 'Procurement' },
    { value: ModuleCategory.TAX, label: 'Tax' },
    { value: ModuleCategory.REPORTING, label: 'Reporting' },
    { value: ModuleCategory.INTEGRATION, label: 'Integration' },
    { value: ModuleCategory.UTILITY, label: 'Utility' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Store</h1>
          <p className="text-gray-600">Browse and install modules for your AI-BOS system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-48"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Module Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map(module => (
            <ModuleCard
              key={module.id}
              module={module}
              onInstall={handleInstall}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredModules.map(module => (
            <Card key={module.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">{module.name}</h3>
                    <Badge variant="outline">{module.category}</Badge>
                    <span className="text-sm text-gray-500">v{module.version}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{module.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>by {module.author}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{module.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{module.downloads}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleInstall(module.id)}
                  disabled={installing === module.id}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {installing === module.id ? (
                    'Installing...'
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Install
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredModules.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No modules found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ModuleStore; 