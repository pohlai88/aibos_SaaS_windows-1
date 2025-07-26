// ==================== AI-BOS OLLAMA SERVICE ====================
// Lightweight Ollama Integration for AI-BOS
// Optimized for Performance - No Timeout Issues

import { OllamaConnector } from '../OllamaConnector';

export interface OllamaServiceConfig {
  enableOllama: boolean;
  fallbackToCloud: boolean;
  defaultModel: string;
  timeout: number;
}

export class OllamaService {
  private connector: OllamaConnector;
  private config: OllamaServiceConfig;
  private isAvailable: boolean = false;

  constructor(config: OllamaServiceConfig) {
    this.config = config;
    this.connector = new OllamaConnector();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.isAvailable = await this.connector.testConnection();
      console.log(`🤖 Ollama Service: ${this.isAvailable ? 'Available' : 'Unavailable'}`);
    } catch (error) {
      console.warn('⚠️ Ollama Service: Connection failed, will use fallback');
      this.isAvailable = false;
    }
  }

  async generateText(prompt: string, model?: string): Promise<string> {
    if (this.isAvailable && this.config.enableOllama) {
      try {
        return await this.connector.generateText(prompt, {
          model: model || this.config.defaultModel
        });
      } catch (error) {
        console.warn('Ollama generation failed, using fallback');
      }
    }

    if (this.config.fallbackToCloud) {
      return this.generateFallbackText(prompt);
    }

    throw new Error('No AI service available');
  }

  private generateFallbackText(prompt: string): string {
    // Simple fallback for now
    return `AI Response: ${prompt.substring(0, 100)}...`;
  }

  getStatus(): { available: boolean; config: OllamaServiceConfig } {
    return {
      available: this.isAvailable,
      config: this.config
    };
  }
}
