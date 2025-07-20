'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentAttachment, 
  DocumentMetadata, 
  DocumentCategory, 
  DocumentStatus,
  DocumentVersion,
  DocumentPermission,
  DocumentSearchResult
} from '@aibos/ledger-sdk';
import { 
  LuxuryTabs, 
  LuxuryModal, 
  LuxurySelect, 
  GlassPanel, 
  MetricCard,
  DashboardSection 
} from '../ui';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Share, 
  Lock,
  Unlock,
  Calendar,
  User,
  Tag,
  Folder,
  Plus,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface DocumentAttachmentsProps {
  organizationId: string;
}

export default function DocumentAttachments({ organizationId }: DocumentAttachmentsProps) {
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [searchResults, setSearchResults] = useState<DocumentSearchResult[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentAttachment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '' as DocumentCategory | '',
    status: '' as DocumentStatus | '',
    uploadedBy: '',
    dateFrom: '',
    dateTo: ''
  });

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: '',
    description: '',
    category: 'other' as DocumentCategory,
    tags: [] as string[],
    relatedEntityType: '',
    relatedEntityId: '',
    isPublic: false,
    expiryDate: ''
  });

  // Permissions form state
  const [permissionsForm, setPermissionsForm] = useState({
    userId: '',
    roleId: '',
    permissionType: 'read' as 'read' | 'write' | 'delete' | 'admin'
  });

  useEffect(() => {
    loadData();
  }, [organizationId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'documents':
          // Load documents
          break;
        case 'search':
          // Load search results
          break;
        case 'statistics':
          // Load statistics
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      if (!uploadForm.file) return;

      // Upload logic here
      setShowUploadModal(false);
      setUploadForm({
        file: null,
        title: '',
        description: '',
        category: 'other',
        tags: [],
        relatedEntityType: '',
        relatedEntityId: '',
        isPublic: false,
        expiryDate: ''
      });
      await loadData();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSearch = async () => {
    try {
      if (!searchTerm.trim()) return;
      // Search logic here
    } catch (error) {
      console.error('Error searching documents:', error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      // Delete logic here
      await loadData();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleSetPermissions = async () => {
    try {
      if (!selectedDocument) return;
      // Set permissions logic here
      setShowPermissionsModal(false);
      setPermissionsForm({
        userId: '',
        roleId: '',
        permissionType: 'read'
      });
    } catch (error) {
      console.error('Error setting permissions:', error);
    }
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'invoice':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'bill':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'receipt':
        return <FileText className="w-4 h-4 text-yellow-500" />;
      case 'contract':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'statement':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'report':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'certificate':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'license':
        return <FileText className="w-4 h-4 text-pink-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'archived':
        return 'text-gray-600 bg-gray-50';
      case 'expired':
        return 'text-red-600 bg-red-50';
      case 'deleted':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabs = [
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Document Attachments</h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <LuxurySelect
                  value={filters.category}
                  onChange={(value) => setFilters({ ...filters, category: value as DocumentCategory })}
                  options={[
                    { value: '', label: 'All Categories' },
                    { value: 'invoice', label: 'Invoice' },
                    { value: 'bill', label: 'Bill' },
                    { value: 'receipt', label: 'Receipt' },
                    { value: 'contract', label: 'Contract' },
                    { value: 'statement', label: 'Statement' },
                    { value: 'report', label: 'Report' },
                    { value: 'certificate', label: 'Certificate' },
                    { value: 'license', label: 'License' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <LuxurySelect
                  value={filters.status}
                  onChange={(value) => setFilters({ ...filters, status: value as DocumentStatus })}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'archived', label: 'Archived' },
                    { value: 'expired', label: 'Expired' },
                    { value: 'deleted', label: 'Deleted' }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Uploaded By</label>
                <input
                  type="text"
                  value={filters.uploadedBy}
                  onChange={(e) => setFilters({ ...filters, uploadedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by user"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadData}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <GlassPanel key={document.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(document.category)}
                    <div>
                      <h4 className="font-semibold text-lg">{document.title}</h4>
                      <p className="text-sm text-gray-600">{document.fileName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedDocument(document);
                        setShowDocumentDetails(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDocument(document);
                        setShowPermissionsModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                    >
                      <Share className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{document.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {document.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{formatFileSize(document.fileSize)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{document.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="font-medium">{new Date(document.createdAt).toLocaleDateString()}</span>
                  </div>
                  {document.expiryDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium">{new Date(document.expiryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Search Documents</h3>
          
          <div className="bg-white rounded-lg p-6 border">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents by title, description, or filename..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <GlassPanel key={result.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getCategoryIcon(result.category)}
                        <h4 className="font-semibold text-lg">{result.title}</h4>
                        <span className="text-sm text-gray-500">Score: {result.relevanceScore}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Category: {result.category}</span>
                        <span>Size: {formatFileSize(result.fileSize)}</span>
                        <span>Uploaded: {new Date(result.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: <BarChart3 className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Document Statistics</h3>

          {statistics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Documents"
                  value={statistics.totalDocuments.toString()}
                  icon={<FileText className="w-6 h-6" />}
                  trend="up"
                  trendValue="15%"
                />
                <MetricCard
                  title="Total Size"
                  value={formatFileSize(statistics.totalSize)}
                  icon={<Folder className="w-6 h-6" />}
                  trend="up"
                  trendValue="8.2%"
                />
                <MetricCard
                  title="Recent Uploads"
                  value={statistics.recentUploads.toString()}
                  icon={<Upload className="w-6 h-6" />}
                  trend="up"
                  trendValue="12%"
                />
                <MetricCard
                  title="Active Documents"
                  value={statistics.byStatus?.active?.toString() || '0'}
                  icon={<CheckCircle className="w-6 h-6" />}
                  trend="up"
                  trendValue="5.3%"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassPanel className="p-6">
                  <h4 className="font-semibold mb-4">Documents by Category</h4>
                  <div className="space-y-3">
                    {Object.entries(statistics.byCategory || {}).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{category}</span>
                        <span className="text-sm text-gray-600">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </GlassPanel>

                <GlassPanel className="p-6">
                  <h4 className="font-semibold mb-4">Documents by Status</h4>
                  <div className="space-y-3">
                    {Object.entries(statistics.byStatus || {}).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{status}</span>
                        <span className="text-sm text-gray-600">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </div>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <DashboardSection title="Document Attachments" description="Manage document uploads, storage, and organization">
        <LuxuryTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mt-6"
        />
      </DashboardSection>

      {/* Upload Modal */}
      <LuxuryModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">File</label>
            <input
              type="file"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <LuxurySelect
                value={uploadForm.category}
                onChange={(value) => setUploadForm({ ...uploadForm, category: value as DocumentCategory })}
                options={[
                  { value: 'invoice', label: 'Invoice' },
                  { value: 'bill', label: 'Bill' },
                  { value: 'receipt', label: 'Receipt' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'statement', label: 'Statement' },
                  { value: 'report', label: 'Report' },
                  { value: 'certificate', label: 'Certificate' },
                  { value: 'license', label: 'License' },
                  { value: 'other', label: 'Other' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date (Optional)</label>
              <input
                type="date"
                value={uploadForm.expiryDate}
                onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={uploadForm.tags.join(', ')}
              onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={uploadForm.isPublic}
              onChange={(e) => setUploadForm({ ...uploadForm, isPublic: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm">Public Document</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowUploadModal(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFileUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Document
          </button>
        </div>
      </LuxuryModal>

      {/* Document Details Modal */}
      <LuxuryModal
        isOpen={showDocumentDetails}
        onClose={() => setShowDocumentDetails(false)}
        title={selectedDocument?.title || 'Document Details'}
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Category</label>
                <p className="text-sm capitalize">{selectedDocument.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <p className="text-sm capitalize">{selectedDocument.status}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Description</label>
              <p className="text-sm">{selectedDocument.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">File Information</label>
              <div className="mt-2 space-y-1">
                <p className="text-sm">Name: {selectedDocument.fileName}</p>
                <p className="text-sm">Size: {formatFileSize(selectedDocument.fileSize)}</p>
                <p className="text-sm">Type: {selectedDocument.mimeType}</p>
              </div>
            </div>
            {selectedDocument.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Tags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDocument.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Uploaded By</label>
                <p className="text-sm">{selectedDocument.uploadedBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Upload Date</label>
                <p className="text-sm">{new Date(selectedDocument.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {selectedDocument.expiryDate && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Expiry Date</label>
                <p className="text-sm">{new Date(selectedDocument.expiryDate).toLocaleDateString()}</p>
              </div>
            )}
            {selectedDocument.versions.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Versions</label>
                <div className="mt-2 space-y-2">
                  {selectedDocument.versions.map((version) => (
                    <div key={version.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">Version {version.versionNumber}</span>
                      <span className="text-sm text-gray-600">{new Date(version.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </LuxuryModal>

      {/* Permissions Modal */}
      <LuxuryModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title="Set Document Permissions"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">User ID</label>
            <input
              type="text"
              value={permissionsForm.userId}
              onChange={(e) => setPermissionsForm({ ...permissionsForm, userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role ID (Optional)</label>
            <input
              type="text"
              value={permissionsForm.roleId}
              onChange={(e) => setPermissionsForm({ ...permissionsForm, roleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Permission Type</label>
            <LuxurySelect
              value={permissionsForm.permissionType}
              onChange={(value) => setPermissionsForm({ ...permissionsForm, permissionType: value as any })}
              options={[
                { value: 'read', label: 'Read' },
                { value: 'write', label: 'Write' },
                { value: 'delete', label: 'Delete' },
                { value: 'admin', label: 'Admin' }
              ]}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowPermissionsModal(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSetPermissions}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Set Permissions
          </button>
        </div>
      </LuxuryModal>
    </div>
  );
} 