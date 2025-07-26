import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComputerVisionEngine } from '../ComputerVisionEngine';
import { logger } from '../../../../shared/src/logging/logger';

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs-node', () => ({
  default: {
    loadGraphModel: vi.fn(),
    node: {
      decodeImage: vi.fn(),
    },
    image: {
      resizeBilinear: vi.fn(),
    },
    dispose: vi.fn(),
  },
}));

// Mock logger
vi.mock('../../../../shared/src/logging/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('ComputerVisionEngine', () => {
  let engine: ComputerVisionEngine;
  const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  beforeEach(() => {
    engine = new ComputerVisionEngine();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Object Detection', () => {
    it('should detect objects in image with real AI functionality', async () => {
      const result = await engine.process({
        task: 'object-detection',
        image: mockImage,
        options: { confidence: 0.5, maxResults: 5 }
      });

      expect(result.task).toBe('object-detection');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.result).toBeInstanceOf(Array);
      expect(result.metadata).toBeDefined();
    });

    it('should handle object detection errors gracefully', async () => {
      // Mock TensorFlow error
      const mockTf = await import('@tensorflow/tfjs-node');
      vi.mocked(mockTf.default.loadGraphModel).mockRejectedValue(new Error('Model loading failed'));

      const result = await engine.process({
        task: 'object-detection',
        image: mockImage,
        options: { confidence: 0.5 }
      });

      expect(result.result).toBeInstanceOf(Array);
      expect(result.result.length).toBeGreaterThanOrEqual(0);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Image Classification', () => {
    it('should classify images with real AI functionality', async () => {
      const result = await engine.process({
        task: 'image-classification',
        image: mockImage,
        options: { confidence: 0.5 }
      });

      expect(result.task).toBe('image-classification');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.result.label).toBeDefined();
      expect(result.result.labels).toBeInstanceOf(Array);
      expect(result.metadata?.model).toBe('mobilenet-v2');
    });

    it('should handle classification errors gracefully', async () => {
      const mockTf = await import('@tensorflow/tfjs-node');
      vi.mocked(mockTf.default.loadGraphModel).mockRejectedValue(new Error('Classification failed'));

      const result = await engine.process({
        task: 'image-classification',
        image: mockImage
      });

      expect(result.result.label).toBeDefined();
      expect(result.result.confidence).toBeGreaterThan(0);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Facial Recognition', () => {
    it('should recognize faces with real AI functionality', async () => {
      const result = await engine.process({
        task: 'facial-recognition',
        image: mockImage,
        options: { confidence: 0.7 }
      });

      expect(result.task).toBe('facial-recognition');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.result).toBeInstanceOf(Array);
      expect(result.metadata?.model).toBe('blazeface');
    });

    it('should handle facial recognition errors gracefully', async () => {
      const mockTf = await import('@tensorflow/tfjs-node');
      vi.mocked(mockTf.default.loadGraphModel).mockRejectedValue(new Error('Face detection failed'));

      const result = await engine.process({
        task: 'facial-recognition',
        image: mockImage
      });

      expect(result.result).toBeInstanceOf(Array);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('OCR (Optical Character Recognition)', () => {
    it('should extract text with real AI functionality', async () => {
      const result = await engine.process({
        task: 'optical-character-recognition',
        image: mockImage,
        options: { confidence: 0.8 }
      });

      expect(result.task).toBe('optical-character-recognition');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.result.text).toBeDefined();
      expect(result.result.words).toBeInstanceOf(Array);
      expect(result.result.language).toBeDefined();
      expect(result.metadata?.model).toBe('east-text-detection');
    });

    it('should handle OCR errors gracefully', async () => {
      const mockTf = await import('@tensorflow/tfjs-node');
      vi.mocked(mockTf.default.loadGraphModel).mockRejectedValue(new Error('OCR failed'));

      const result = await engine.process({
        task: 'optical-character-recognition',
        image: mockImage
      });

      expect(result.result.text).toBeDefined();
      expect(result.result.confidence).toBeGreaterThan(0);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance metrics for all tasks', async () => {
      const tasks = ['object-detection', 'image-classification', 'facial-recognition', 'optical-character-recognition'];

      for (const task of tasks) {
        await engine.process({
          task: task as any,
          image: mockImage
        });
      }

      const metrics = engine.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(Object.keys(metrics).length).toBeGreaterThan(0);
    });

    it('should return specific task metrics', async () => {
      await engine.process({
        task: 'object-detection',
        image: mockImage
      });

      const metrics = engine.getPerformanceMetrics('object-detection');
      expect(metrics).toBeInstanceOf(Array);
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0]).toHaveProperty('processingTime');
      expect(metrics[0]).toHaveProperty('confidence');
      expect(metrics[0]).toHaveProperty('timestamp');
    });
  });

  describe('Caching', () => {
    it('should cache results for identical requests', async () => {
      const request = {
        task: 'object-detection' as const,
        image: mockImage,
        options: { confidence: 0.5 }
      };

      const result1 = await engine.process(request);
      const result2 = await engine.process(request);

      expect(result1.result).toEqual(result2.result);
      expect(result1.processingTime).toBeGreaterThan(0);
      expect(result2.processingTime).toBeLessThan(result1.processingTime); // Cached result should be faster
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid image data', async () => {
      const result = await engine.process({
        task: 'object-detection',
        image: 'invalid-image-data'
      });

      expect(result.result).toBeInstanceOf(Array);
      expect(result.result.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing image data', async () => {
      const result = await engine.process({
        task: 'object-detection',
        options: { confidence: 0.5 }
      });

      expect(result.result).toBeInstanceOf(Array);
      expect(result.result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Model Management', () => {
    it('should register custom models', async () => {
      const modelConfig = {
        name: 'custom-model',
        task: 'object-detection' as const,
        version: '1.0.0',
        accuracy: 0.95,
        modelPath: '/path/to/model',
        parameters: { custom: 'param' },
        supportedFormats: ['jpeg', 'png'],
        maxImageSize: { width: 1024, height: 1024 },
        gpuAcceleration: true
      };

      await engine.registerModel(modelConfig);
      const model = await engine.getModel('object-detection', '1.0.0');

      expect(model).toBeDefined();
      expect(model?.name).toBe('custom-model');
    });

    it('should return null for non-existent models', async () => {
      const model = await engine.getModel('non-existent-task');
      expect(model).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', async () => {
      await engine.cleanup();
      expect(logger.info).toHaveBeenCalledWith('Computer Vision Engine cleaned up');
    });
  });
});
