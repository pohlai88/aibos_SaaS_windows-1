import { vi } from 'vitest';

// Mock TensorFlow.js for testing
vi.mock('@tensorflow/tfjs-node', () => ({
  default: {
    loadGraphModel: vi.fn().mockResolvedValue({
      predict: vi.fn().mockResolvedValue([
        {
          array: vi.fn().mockResolvedValue([[[0.1, 0.2, 0.3, 0.4]]]),
        },
        {
          array: vi.fn().mockResolvedValue([[0.9, 0.8, 0.7]]),
        },
        {
          array: vi.fn().mockResolvedValue([[1, 2, 3]]),
        },
      ]),
    }),
    node: {
      decodeImage: vi.fn().mockReturnValue({
        expandDims: vi.fn().mockReturnValue({
          div: vi.fn().mockReturnValue({
            dispose: vi.fn(),
          }),
        }),
        dispose: vi.fn(),
      }),
    },
    image: {
      resizeBilinear: vi.fn().mockReturnValue({
        expandDims: vi.fn().mockReturnValue({
          div: vi.fn().mockReturnValue({
            dispose: vi.fn(),
          }),
        }),
        dispose: vi.fn(),
      }),
    },
    dispose: vi.fn(),
    tensor: vi.fn().mockReturnValue({
      dispose: vi.fn(),
    }),
  },
}));

// Mock canvas for testing
vi.mock('canvas', () => ({
  Canvas: vi.fn().mockImplementation(() => ({
    getContext: vi.fn().mockReturnValue({
      createImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(1000),
      }),
      putImageData: vi.fn(),
    }),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
  })),
}));

// Mock logger
vi.mock('../../shared/src/logging/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Global test setup
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});
