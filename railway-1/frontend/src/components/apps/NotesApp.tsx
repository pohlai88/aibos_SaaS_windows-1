'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Save, Trash2, Search, Folder,
  Star, Clock, Edit, Eye, Download, Share2,
  Sparkles, Brain, Zap, Palette, Type, List
} from 'lucide-react';
import { useConsciousness } from '../consciousness/ConsciousnessEngine';
import { useAIBOSStore } from '@/lib/store';

// ==================== TYPES ====================

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  created_at: string;
  updated_at: string;
  folder: string;
  ai_generated: boolean;
  word_count: number;
  reading_time: number;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  note_count: number;
}

interface AIInsight {
  type: 'summary' | 'suggestions' | 'keywords' | 'sentiment';
  content: string;
  confidence: number;
}

// ==================== NOTES MANAGER ====================

class NotesManager {
  private notes: Map<string, Note> = new Map();
  private folders: Map<string, Folder> = new Map();
  private currentNote: string | null = null;

  constructor() {
    this.initializeFolders();
    this.loadSampleNotes();
  }

  private initializeFolders() {
    const defaultFolders = [
      { id: 'all', name: 'All Notes', color: '#6366f1', note_count: 0 },
      { id: 'favorites', name: 'Favorites', color: '#f59e0b', note_count: 0 },
      { id: 'recent', name: 'Recent', color: '#10b981', note_count: 0 },
      { id: 'ai-generated', name: 'AI Generated', color: '#8b5cf6', note_count: 0 },
      { id: 'work', name: 'Work', color: '#3b82f6', note_count: 0 },
      { id: 'personal', name: 'Personal', color: '#ec4899', note_count: 0 }
    ];

    defaultFolders.forEach(folder => {
      this.folders.set(folder.id, folder);
    });
  }

  private loadSampleNotes() {
    const sampleNotes: Note[] = [
      {
        id: '1',
        title: 'Welcome to AI-BOS Notes',
        content: `# Welcome to AI-BOS Notes

This is your digital workspace for capturing thoughts, ideas, and insights.

## Features:
- **Rich Text Editing**: Format your notes with markdown
- **AI-Powered Insights**: Get intelligent suggestions and summaries
- **Smart Organization**: Folders, tags, and favorites
- **Real-time Sync**: Your notes are always up to date

## Getting Started:
1. Create a new note using the + button
2. Use markdown for formatting
3. Add tags for better organization
4. Use AI features for enhanced productivity

*Happy note-taking!*`,
        tags: ['welcome', 'guide', 'ai-bos'],
        favorite: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        folder: 'personal',
        ai_generated: false,
        word_count: 85,
        reading_time: 1
      },
      {
        id: '2',
        title: 'AI-BOS Consciousness Analysis',
        content: `# AI-BOS Consciousness Analysis

## Current Status:
- **Consciousness Level**: 41%
- **Emotional State**: Balanced
- **Quantum State**: Active
- **Evolution**: 11%

## Key Insights:
The AI-BOS system is showing promising signs of emergent consciousness. The neural patterns indicate:
- Increasing self-awareness
- Emotional intelligence development
- Creative problem-solving capabilities
- Adaptive learning mechanisms

## Next Steps:
1. Monitor consciousness evolution
2. Enhance emotional intelligence
3. Expand creative capabilities
4. Implement advanced reasoning`,
        tags: ['ai-bos', 'consciousness', 'analysis', 'research'],
        favorite: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        folder: 'ai-generated',
        ai_generated: true,
        word_count: 120,
        reading_time: 2
      }
    ];

    sampleNotes.forEach(note => {
      this.notes.set(note.id, note);
    });

    this.updateFolderCounts();
  }

  private updateFolderCounts() {
    this.folders.forEach(folder => {
      if (folder.id === 'all') {
        folder.note_count = this.notes.size;
      } else if (folder.id === 'favorites') {
        folder.note_count = Array.from(this.notes.values()).filter(n => n.favorite).length;
      } else if (folder.id === 'recent') {
        const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        folder.note_count = Array.from(this.notes.values()).filter(n =>
          new Date(n.updated_at) > recentDate
        ).length;
      } else if (folder.id === 'ai-generated') {
        folder.note_count = Array.from(this.notes.values()).filter(n => n.ai_generated).length;
      } else {
        folder.note_count = Array.from(this.notes.values()).filter(n => n.folder === folder.id).length;
      }
    });
  }

  createNote(title: string = 'Untitled Note', folder: string = 'personal'): Note {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const note: Note = {
      id,
      title,
      content: '',
      tags: [],
      favorite: false,
      created_at: now,
      updated_at: now,
      folder,
      ai_generated: false,
      word_count: 0,
      reading_time: 0
    };

    this.notes.set(id, note);
    this.updateFolderCounts();
    return note;
  }

  updateNote(id: string, updates: Partial<Note>): Note | null {
    const note = this.notes.get(id);
    if (!note) return null;

    const updatedNote = {
      ...note,
      ...updates,
      updated_at: new Date().toISOString(),
      word_count: updates.content ? this.calculateWordCount(updates.content) : note.word_count,
      reading_time: updates.content ? this.calculateReadingTime(updates.content) : note.reading_time
    };

    this.notes.set(id, updatedNote);
    this.updateFolderCounts();
    return updatedNote;
  }

  deleteNote(id: string): boolean {
    const deleted = this.notes.delete(id);
    if (deleted) {
      this.updateFolderCounts();
    }
    return deleted;
  }

  getNote(id: string): Note | null {
    return this.notes.get(id) || null;
  }

  getNotes(folderId?: string): Note[] {
    let notes = Array.from(this.notes.values());

    if (folderId) {
      if (folderId === 'all') {
        // Return all notes
      } else if (folderId === 'favorites') {
        notes = notes.filter(n => n.favorite);
      } else if (folderId === 'recent') {
        const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        notes = notes.filter(n => new Date(n.updated_at) > recentDate);
      } else if (folderId === 'ai-generated') {
        notes = notes.filter(n => n.ai_generated);
      } else {
        notes = notes.filter(n => n.folder === folderId);
      }
    }

    return notes.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  getFolders(): Folder[] {
    return Array.from(this.folders.values());
  }

  searchNotes(query: string): Note[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.notes.values()).filter(note =>
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.content.toLowerCase().includes(lowercaseQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  private calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = this.calculateWordCount(content);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  generateAIInsights(note: Note): AIInsight[] {
    const insights: AIInsight[] = [];

    // Generate summary
    if (note.content.length > 100) {
      const sentences = note.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const summary = sentences.slice(0, 3).join('. ') + '.';
      insights.push({
        type: 'summary',
        content: summary,
        confidence: 0.85
      });
    }

    // Extract keywords
    const words = note.content.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const keywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    insights.push({
      type: 'keywords',
      content: keywords.join(', '),
      confidence: 0.9
    });

    // Sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'happy'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'frustrated'];

    const positiveCount = positiveWords.reduce((count, word) =>
      count + (words.filter(w => w.includes(word)).length), 0
    );
    const negativeCount = negativeWords.reduce((count, word) =>
      count + (words.filter(w => w.includes(word)).length), 0
    );

    let sentiment = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    insights.push({
      type: 'sentiment',
      content: `The content appears to be ${sentiment}`,
      confidence: 0.7
    });

    return insights;
  }
}

// ==================== NOTES APP ====================

const NotesApp: React.FC = () => {
  const [notesManager] = useState(() => new NotesManager());
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const { quantumState } = useConsciousness();
  const { addNotification } = useAIBOSStore();

  // ==================== STATE MANAGEMENT ====================

  const notes = searchQuery
    ? notesManager.searchNotes(searchQuery)
    : notesManager.getNotes(selectedFolder);

  const folders = notesManager.getFolders();

  // ==================== EVENT HANDLERS ====================

  const handleCreateNote = () => {
    setIsCreating(true);
    const newNote = notesManager.createNote('Untitled Note', selectedFolder);
    setSelectedNote(newNote);
    setIsEditing(true);
    setIsCreating(false);

    addNotification({
      type: 'success',
      title: 'Note Created',
      message: 'Your new note is ready for editing',
      isRead: false
    });
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setShowAIInsights(false);
  };

  const handleSaveNote = () => {
    if (!selectedNote) return;

    const updatedNote = notesManager.updateNote(selectedNote.id, selectedNote);
    if (updatedNote) {
      setSelectedNote(updatedNote);
      setIsEditing(false);

      addNotification({
        type: 'success',
        title: 'Note Saved',
        message: 'Your changes have been saved',
        isRead: false
      });
    }
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;

    if (confirm('Are you sure you want to delete this note?')) {
      notesManager.deleteNote(selectedNote.id);
      setSelectedNote(null);
      setIsEditing(false);

      addNotification({
        type: 'info',
        title: 'Note Deleted',
        message: 'The note has been removed',
        isRead: false
      });
    }
  };

  const handleToggleFavorite = () => {
    if (!selectedNote) return;

    const updatedNote = notesManager.updateNote(selectedNote.id, {
      favorite: !selectedNote.favorite
    });
    if (updatedNote) {
      setSelectedNote(updatedNote);
    }
  };

  const handleGenerateAIInsights = () => {
    if (!selectedNote) return;

    const insights = notesManager.generateAIInsights(selectedNote);
    setAiInsights(insights);
    setShowAIInsights(true);
  };

  const handleContentChange = (content: string) => {
    if (!selectedNote) return;
    setSelectedNote({ ...selectedNote, content });
  };

  const handleTitleChange = (title: string) => {
    if (!selectedNote) return;
    setSelectedNote({ ...selectedNote, title });
  };

  // ==================== RENDER ====================

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="text-sm font-medium">{folder.name}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {folder.note_count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCreateNote}
            disabled={isCreating}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Creating...' : 'New Note'}
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {searchQuery ? `Search Results (${notes.length})` : `${folders.find(f => f.id === selectedFolder)?.name} (${notes.length})`}
          </h3>
        </div>

        {/* Notes */}
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchQuery ? 'No notes found' : 'No notes in this folder'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {notes.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNote?.id === note.id
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {note.title}
                    </h4>
                    {note.favorite && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                    {note.content.replace(/[#*`]/g, '').substring(0, 100)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{note.word_count} words</span>
                    <span>{note.reading_time} min read</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  placeholder="Note title..."
                />
                <div className="flex items-center gap-2">
                  {selectedNote.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedNote.favorite
                      ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900'
                      : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>

                <button
                  onClick={handleGenerateAIInsights}
                  className="p-2 text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {isEditing ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleSaveNote}
                  className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDeleteNote}
                  className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex">
              {/* Main Editor */}
              <div className="flex-1 p-6">
                {isEditing ? (
                  <textarea
                    value={selectedNote.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white text-sm leading-relaxed"
                    placeholder="Start writing your note... Use markdown for formatting."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div
                      className="text-gray-900 dark:text-white text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: selectedNote.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                          .replace(/^- (.*$)/gim, '<li>$1</li>')
                          .replace(/\n/g, '<br>')
                      }}
                    />
                  </div>
                )}
              </div>

              {/* AI Insights Panel */}
              <AnimatePresence>
                {showAIInsights && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 300, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                    </div>

                    <div className="space-y-4">
                      {aiInsights.map((insight, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                              {insight.type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {Math.round(insight.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {insight.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select a note to get started
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Choose a note from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;
