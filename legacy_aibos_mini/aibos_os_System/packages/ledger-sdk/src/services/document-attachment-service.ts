import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  DocumentAttachment,
  DocumentMetadata,
  DocumentCategory,
  DocumentStatus,
  DocumentVersion,
  DocumentPermission,
  DocumentSearchResult
} from '../../types';

export class DocumentAttachmentService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Upload document attachment
   */
  async uploadDocument(
    organizationId: string,
    file: File,
    metadata: Omit<DocumentMetadata, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ attachment: DocumentAttachment | null; error: any }> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${metadata.category}_${timestamp}.${fileExtension}`;
      const filePath = `${organizationId}/${metadata.category}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('document-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('document-attachments')
        .getPublicUrl(filePath);

      // Create document metadata record
      const { data: document, error: dbError } = await this.supabase
        .from('document_attachments')
        .insert({
          organizationId: organizationId,
          file_name: file.name,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          category: metadata.category,
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          related_entity_type: metadata.relatedEntityType,
          related_entity_id: metadata.relatedEntityId,
          status: metadata.status,
          is_public: metadata.isPublic,
          expiry_date: metadata.expiryDate,
          uploaded_by: metadata.uploadedBy
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Create initial version record
      const { error: versionError } = await this.supabase
        .from('document_versions')
        .insert({
          document_id: document.id,
          version_number: 1,
          file_path: filePath,
          file_size: file.size,
          uploaded_by: metadata.uploadedBy,
          change_notes: 'Initial upload'
        });

      if (versionError) throw versionError;

      return { attachment: this.formatDocumentAttachment(document), error: null };

    } catch (error) {
      return { attachment: null, error };
    }
  }

  /**
   * Get document attachment by ID
   */
  async getDocumentById(documentId: string): Promise<{ attachment: DocumentAttachment | null; error: any }> {
    try {
      const { data: document, error } = await this.supabase
        .from('document_attachments')
        .select(`
          *,
          versions:document_versions(*)
        `)
        .eq('id', documentId)
        .single();

      if (error) throw error;

      return { attachment: this.formatDocumentAttachment(document), error: null };

    } catch (error) {
      return { attachment: null, error };
    }
  }

  /**
   * Get documents with filtering
   */
  async getDocuments(
    organizationId: string,
    filters?: {
      category?: DocumentCategory;
      status?: DocumentStatus;
      relatedEntityType?: string;
      relatedEntityId?: string;
      uploadedBy?: string;
      tags?: string[];
    },
    page: number = 1,
    limit: number = 20
  ): Promise<{ documents: DocumentAttachment[]; total: number; error: any }> {
    try {
      let query = this.supabase
        .from('document_attachments')
        .select(`
          *,
          versions:document_versions(*)
        `, { count: 'exact' })
        .eq('organizationId', organizationId);

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.relatedEntityType) {
        query = query.eq('related_entity_type', filters.relatedEntityType);
      }

      if (filters?.relatedEntityId) {
        query = query.eq('related_entity_id', filters.relatedEntityId);
      }

      if (filters?.uploadedBy) {
        query = query.eq('uploaded_by', filters.uploadedBy);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // Order by creation date
      query = query.order('createdAt', { ascending: false });

      const { data: documents, error, count } = await query;

      if (error) throw error;

      const formattedDocuments = documents?.map(document => this.formatDocumentAttachment(document)) || [];

      return { documents: formattedDocuments, total: count || 0, error: null };

    } catch (error) {
      return { documents: [], total: 0, error };
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(
    organizationId: string,
    searchTerm: string,
    filters?: {
      category?: DocumentCategory;
      status?: DocumentStatus;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<{ results: DocumentSearchResult[]; error: any }> {
    try {
      let query = this.supabase
        .from('document_attachments')
        .select('*')
        .eq('organizationId', organizationId)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%`);

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte('createdAt', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('createdAt', filters.dateTo);
      }

      // Order by relevance (could be enhanced with full-text search)
      query = query.order('createdAt', { ascending: false });

      const { data: documents, error } = await query;

      if (error) throw error;

      const results: DocumentSearchResult[] = documents?.map(document => ({
        id: document.id,
        title: document.title,
        description: document.description,
        category: document.category,
        fileName: document.file_name,
        fileUrl: document.file_url,
        fileSize: document.file_size,
        mimeType: document.mime_type,
        relatedEntityType: document.related_entity_type,
        relatedEntityId: document.related_entity_id,
        uploadedBy: document.uploaded_by,
        createdAt: document.createdAt,
        relevanceScore: this.calculateRelevanceScore(document, searchTerm)
      })) || [];

      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return { results, error: null };

    } catch (error) {
      return { results: [], error };
    }
  }

  /**
   * Update document metadata
   */
  async updateDocumentMetadata(
    documentId: string,
    updates: Partial<DocumentMetadata>
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { error } = await this.supabase
        .from('document_attachments')
        .update({
          title: updates.title,
          description: updates.description,
          tags: updates.tags,
          status: updates.status,
          is_public: updates.isPublic,
          expiry_date: updates.expiryDate,
          updatedAt: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      return { success: true, error: null };

    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Upload new version of document
   */
  async uploadNewVersion(
    documentId: string,
    file: File,
    changeNotes: string,
    uploadedBy: string
  ): Promise<{ version: DocumentVersion | null; error: any }> {
    try {
      // Get current document
      const { data: currentDoc, error: fetchError } = await this.supabase
        .from('document_attachments')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Get latest version number
      const { data: latestVersion, error: versionError } = await this.supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      if (versionError && versionError.code !== 'PGRST116') throw versionError;

      const newVersionNumber = (latestVersion?.version_number || 0) + 1;

      // Generate new file path
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${currentDoc.category}_v${newVersionNumber}_${timestamp}.${fileExtension}`;
      const filePath = `${currentDoc.organizationId}/${currentDoc.category}/${fileName}`;

      // Upload new file
      const { error: uploadError } = await this.supabase.storage
        .from('document-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('document-attachments')
        .getPublicUrl(filePath);

      // Create new version record
      const { data: version, error: createError } = await this.supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: newVersionNumber,
          file_path: filePath,
          file_size: file.size,
          uploaded_by: uploadedBy,
          change_notes: changeNotes
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update main document record
      await this.supabase
        .from('document_attachments')
        .update({
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          updatedAt: new Date().toISOString()
        })
        .eq('id', documentId);

      return { version: this.formatDocumentVersion(version), error: null };

    } catch (error) {
      return { version: null, error };
    }
  }

  /**
   * Get document versions
   */
  async getDocumentVersions(documentId: string): Promise<{ versions: DocumentVersion[]; error: any }> {
    try {
      const { data: versions, error } = await this.supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      const formattedVersions = versions?.map(version => this.formatDocumentVersion(version)) || [];

      return { versions: formattedVersions, error: null };

    } catch (error) {
      return { versions: [], error };
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Get document info
      const { data: document, error: fetchError } = await this.supabase
        .from('document_attachments')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete all versions from storage
      const { data: versions, error: versionsError } = await this.supabase
        .from('document_versions')
        .select('file_path')
        .eq('document_id', documentId);

      if (versionsError) throw versionsError;

      // Delete files from storage
      for (const version of versions || []) {
        await this.supabase.storage
          .from('document-attachments')
          .remove([version.file_path]);
      }

      // Delete version records
      await this.supabase
        .from('document_versions')
        .delete()
        .eq('document_id', documentId);

      // Delete main document record
      const { error: deleteError } = await this.supabase
        .from('document_attachments')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      return { success: true, error: null };

    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Set document permissions
   */
  async setDocumentPermissions(
    documentId: string,
    permissions: DocumentPermission[]
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Delete existing permissions
      await this.supabase
        .from('document_permissions')
        .delete()
        .eq('document_id', documentId);

      // Insert new permissions
      if (permissions.length > 0) {
        const permissionRecords = permissions.map(permission => ({
          document_id: documentId,
          userId: permission.userId,
          role_id: permission.roleId,
          permission_type: permission.permissionType,
          granted_by: permission.grantedBy
        }));

        const { error } = await this.supabase
          .from('document_permissions')
          .insert(permissionRecords);

        if (error) throw error;
      }

      return { success: true, error: null };

    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Get document permissions
   */
  async getDocumentPermissions(documentId: string): Promise<{ permissions: DocumentPermission[]; error: any }> {
    try {
      const { data: permissions, error } = await this.supabase
        .from('document_permissions')
        .select('*')
        .eq('document_id', documentId);

      if (error) throw error;

      const formattedPermissions = permissions?.map(permission => ({
        id: permission.id,
        documentId: permission.document_id,
        userId: permission.userId,
        roleId: permission.role_id,
        permissionType: permission.permission_type,
        grantedBy: permission.granted_by,
        grantedAt: permission.granted_at
      })) || [];

      return { permissions: formattedPermissions, error: null };

    } catch (error) {
      return { permissions: [], error };
    }
  }

  /**
   * Get document statistics
   */
  async getDocumentStatistics(organizationId: string): Promise<{ statistics: any; error: any }> {
    try {
      const { data: documents, error } = await this.supabase
        .from('document_attachments')
        .select('category, status, file_size, createdAt')
        .eq('organizationId', organizationId);

      if (error) throw error;

      const statistics = {
        totalDocuments: documents?.length || 0,
        totalSize: documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0,
        byCategory: documents?.reduce((acc, doc) => {
          acc[doc.category] = (acc[doc.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        byStatus: documents?.reduce((acc, doc) => {
          acc[doc.status] = (acc[doc.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {},
        recentUploads: documents?.filter(doc => {
          const uploadDate = new Date(doc.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return uploadDate >= thirtyDaysAgo;
        }).length || 0
      };

      return { statistics, error: null };

    } catch (error) {
      return { statistics: null, error };
    }
  }

  /**
   * Calculate relevance score for search
   */
  private calculateRelevanceScore(document: any, searchTerm: string): number {
    let score = 0;
    const term = searchTerm.toLowerCase();

    // Title match (highest weight)
    if (document.title?.toLowerCase().includes(term)) {
      score += 10;
    }

    // Description match
    if (document.description?.toLowerCase().includes(term)) {
      score += 5;
    }

    // Filename match
    if (document.file_name?.toLowerCase().includes(term)) {
      score += 3;
    }

    // Tags match
    if (document.tags?.some((tag: string) => tag.toLowerCase().includes(term))) {
      score += 2;
    }

    // Recency bonus
    const daysSinceUpload = (Date.now() - new Date(document.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpload < 7) score += 1;
    else if (daysSinceUpload < 30) score += 0.5;

    return score;
  }

  // Helper methods
  private formatDocumentAttachment(documentData: any): DocumentAttachment {
    return {
      id: documentData.id,
      organizationId: documentData.organizationId,
      fileName: documentData.file_name,
      filePath: documentData.file_path,
      fileUrl: documentData.file_url,
      fileSize: documentData.file_size,
      mimeType: documentData.mime_type,
      category: documentData.category,
      title: documentData.title,
      description: documentData.description,
      tags: documentData.tags || [],
      relatedEntityType: documentData.related_entity_type,
      relatedEntityId: documentData.related_entity_id,
      status: documentData.status,
      isPublic: documentData.is_public,
      expiryDate: documentData.expiry_date,
      uploadedBy: documentData.uploaded_by,
      versions: documentData.versions?.map((version: any) => this.formatDocumentVersion(version)) || [],
      createdAt: documentData.createdAt,
      updatedAt: documentData.updatedAt
    };
  }

  private formatDocumentVersion(versionData: any): DocumentVersion {
    return {
      id: versionData.id,
      documentId: versionData.document_id,
      versionNumber: versionData.version_number,
      filePath: versionData.file_path,
      fileSize: versionData.file_size,
      uploadedBy: versionData.uploaded_by,
      changeNotes: versionData.change_notes,
      createdAt: versionData.createdAt
    };
  }
}