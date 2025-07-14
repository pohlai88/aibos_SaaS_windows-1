import { Logger, LogLevel, logger, createLogger, requestLogger, errorLogger } from '../lib/logger';

describe('Logger', () => {
  let testLogger: Logger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    testLogger = new Logger({
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableStructured: false
    });
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    testLogger.clearRequestContext();
  });

  describe('Log Levels', () => {
    it('should log error messages', () => {
      testLogger.error('Test error message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Test error message')
      );
    });

    it('should log warning messages', () => {
      testLogger.warn('Test warning message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('WARN: Test warning message')
      );
    });

    it('should log info messages', () => {
      testLogger.info('Test info message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO: Test info message')
      );
    });

    it('should log debug messages', () => {
      testLogger.debug('Test debug message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG: Test debug message')
      );
    });

    it('should log trace messages', () => {
      testLogger.trace('Test trace message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TRACE: Test trace message')
      );
    });
  });

  describe('Log Level Filtering', () => {
    it('should not log messages below configured level', () => {
      const infoLogger = new Logger({ level: LogLevel.INFO });
      infoLogger.debug('This should not be logged');
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should log messages at configured level', () => {
      const infoLogger = new Logger({ level: LogLevel.INFO });
      infoLogger.info('This should be logged');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log messages above configured level', () => {
      const infoLogger = new Logger({ level: LogLevel.INFO });
      infoLogger.error('This should be logged');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Context Logging', () => {
    it('should include context in log messages', () => {
      testLogger.info('Test message', { userId: '123', action: 'login' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('userId=123, action=login')
      );
    });

    it('should include request context when set', () => {
      testLogger.setRequestContext('req-123', 'session-456');
      testLogger.info('Test message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('requestId=req-123, sessionId=session-456')
      );
    });

    it('should merge additional context with request context', () => {
      testLogger.setRequestContext('req-123');
      testLogger.info('Test message', { userId: '456' });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('requestId=req-123, userId=456')
      );
    });
  });

  describe('Error Logging', () => {
    it('should log error objects', () => {
      const error = new Error('Test error');
      testLogger.error('Error occurred', undefined, error);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Error occurred')
      );
    });

    it('should log error with context', () => {
      const error = new Error('Test error');
      testLogger.error('Error occurred', { component: 'auth' }, error);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('component=auth')
      );
    });
  });

  describe('Structured Logging', () => {
    it('should output JSON when structured logging is enabled', () => {
      const structuredLogger = new Logger({
        enableStructured: true,
        enableConsole: true
      });
      
      structuredLogger.info('Test message', { userId: '123' });
      
      const call = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(call);
      
      expect(parsed).toMatchObject({
        level: LogLevel.INFO,
        message: 'Test message',
        context: expect.objectContaining({
          userId: '123'
        })
      });
    });
  });

  describe('Child Logger', () => {
    it('should create child logger with additional context', () => {
      testLogger.setRequestContext('req-123');
      const childLogger = testLogger.child({ component: 'auth' });
      
      childLogger.info('Test message', { userId: '456' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('requestId=req-123, component=auth, userId=456')
      );
    });

    it('should inherit parent configuration', () => {
      const childLogger = testLogger.child({ component: 'auth' });
      childLogger.debug('Test message');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('Request Context', () => {
    it('should set and clear request context', () => {
      testLogger.setRequestContext('req-123', 'session-456');
      testLogger.info('With context');
      
      testLogger.clearRequestContext();
      testLogger.info('Without context');
      
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy.mock.calls[0][0]).toContain('requestId=req-123');
      expect(consoleSpy.mock.calls[1][0]).not.toContain('requestId=req-123');
    });
  });
});

describe('Global Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should be properly configured', () => {
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should log messages', () => {
    logger.info('Global test message');
    expect(consoleSpy).toHaveBeenCalled();
  });
});

describe('createLogger', () => {
  it('should create logger with component name', () => {
    const authLogger = createLogger('auth');
    expect(authLogger).toBeInstanceOf(Logger);
  });
});

describe('Request Logger Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-agent',
        'x-request-id': 'req-123'
      },
      ip: '127.0.0.1',
      user: { id: 'user-123', tenant_id: 'tenant-456' }
    };

    mockRes = {
      statusCode: 200,
      get: jest.fn().mockReturnValue('1024'),
      end: jest.fn()
    };

    mockNext = jest.fn();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log request and response', () => {
    const middleware = requestLogger();
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('HTTP Request')
    );

    // Simulate response end
    mockRes.end();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('HTTP Response')
    );
  });

  it('should generate request ID if not provided', () => {
    delete mockReq.headers['x-request-id'];
    
    const middleware = requestLogger();
    middleware(mockReq, mockRes, mockNext);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('HTTP Request')
    );
  });
});

describe('Error Logger Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      url: '/api/test',
      user: { id: 'user-123', tenant_id: 'tenant-456' }
    };

    mockRes = {};
    mockNext = jest.fn();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log errors', () => {
    const error = new Error('Test error');
    const middleware = errorLogger();
    
    middleware(error, mockReq, mockRes, mockNext);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: Unhandled Error')
    );
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

describe('Logger Configuration', () => {
  it('should handle different environments', () => {
    const devLogger = new Logger({ environment: 'development' });
    const prodLogger = new Logger({ environment: 'production' });
    
    expect(devLogger).toBeInstanceOf(Logger);
    expect(prodLogger).toBeInstanceOf(Logger);
  });

  it('should handle metrics configuration', () => {
    const metricsLogger = new Logger({ enableMetrics: true });
    expect(metricsLogger).toBeInstanceOf(Logger);
  });
}); 