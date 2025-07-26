// ==================== AI-BOS SIMPLE SERVER ====================
// Simple JavaScript server to test basic setup
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AI-BOS Simple Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test Ollama endpoint
app.get('/api/test-ollama', async (req, res) => {
  try {
    // Test if we can import the Ollama connector
    const { OllamaConnector } = await import('./src/ai-database/OllamaConnector.js');
    const ollama = new OllamaConnector();

    const health = await ollama.getHealth();

    res.json({
      status: 'OK',
      ollama: health,
      message: 'Ollama integration working!'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Ollama integration failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI-BOS Simple Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Ollama test: http://localhost:${PORT}/api/test-ollama`);
});
