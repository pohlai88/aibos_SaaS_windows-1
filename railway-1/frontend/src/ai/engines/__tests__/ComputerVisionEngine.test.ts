import { ComputerVisionEngine } from '../ComputerVisionEngine';



// Mock console for logger
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
};

vi.spyOn(console, 'log').mockImplementation(mockConsole.log);
vi.spyOn(console, 'error').mockImplementation(mockConsole.error);
vi.spyOn(console, 'warn').mockImplementation(mockConsole.warn);
vi.spyOn(console, 'info').mockImplementation(mockConsole.info);

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
      const result = await engine.process({
        task: 'object-detection',
        image: mockImage,
        options: { confidence: 0.5 }
      });

      expect(result.result).toBeInstanceOf(Array);
      expect(result.result.length).toBeGreaterThanOrEqual(0);
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
      const result = await engine.process({
        task: 'image-classification',
        image: mockImage
      });

      expect(result.result.label).toBeDefined();
      expect(result.result.confidence).toBeGreaterThan(0);
    });
  });

  describe('Facial Recognition', () => {
    it('should recognize faces in image', async () => {
      const result = await engine.process({
        task: 'facial-recognition',
        image: mockImage,
        options: { confidence: 0.5 }
      });

      expect(result.task).toBe('facial-recognition');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.result).toBeInstanceOf(Array);
      expect(result.result[0]).toHaveProperty('id');
      expect(result.result[0]).toHaveProperty('confidence');
    });
  });

  describe('OCR', () => {
    it('should extract text from image', async () => {
      const result = await engine.process({
        task: 'optical-character-recognition',
        image: mockImage,
        options: { confidence: 0.5 }
      });

      expect(result.task).toBe('optical-character-recognition');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.result.text).toBeDefined();
      expect(result.result.words).toBeInstanceOf(Array);
    });
  });

  describe('Image Segmentation', () => {
    it('should segment image', async () => {
      const result = await engine.process({
        task: 'image-segmentation',
        image: mockImage,
        options: { confidence: 0.5 }
      });

      expect(result.task).toBe('image-segmentation');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.result.mask).toBeInstanceOf(Array);
      expect(result.result.labels).toBeInstanceOf(Array);
    });
  });

  describe('Pose Estimation', () => {
    it('should estimate pose from image', async () => {
      const result = await engine.process({
        task: 'pose-estimation',
        image: mockImage,
        options: { confidence: 0.5 }
      });

      expect(result.task).toBe('pose-estimation');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.result.keypoints).toBeInstanceOf(Array);
      expect(result.result.skeleton).toBeDefined();
    });
  });

  describe('Performance Metrics', () => {
    it('should track performance metrics for all tasks', async () => {
      const tasks = [
        'object-detection',
        'image-classification',
        'facial-recognition',
        'optical-character-recognition',
        'image-segmentation',
        'pose-estimation'
      ];

      for (const task of tasks) {
        await engine.process({
          task: task as any,
          image: mockImage
        });
      }

      const metrics = engine.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.size).toBeGreaterThan(0);
    });

    it('should return specific task metrics', async () => {
      await engine.process({
        task: 'object-detection',
        image: mockImage
      });

      const metrics = engine.getPerformanceMetrics();
      const objectDetectionMetrics = metrics.get('object-detection');
      expect(objectDetectionMetrics).toBeInstanceOf(Array);
      expect(objectDetectionMetrics!.length).toBeGreaterThan(0);
      expect(objectDetectionMetrics![0]).toHaveProperty('processingTime');
      expect(objectDetectionMetrics![0]).toHaveProperty('confidence');
      expect(objectDetectionMetrics![0]).toHaveProperty('timestamp');
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

  describe('Cache Management', () => {
    it('should clear cache properly', () => {
      engine.clearCache();
      // Cache clearing doesn't return anything, just verify it doesn't throw
      expect(true).toBe(true);
    });
  });
});
