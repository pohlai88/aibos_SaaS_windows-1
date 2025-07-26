// ==================== OLLAMA INTEGRATION TEST ====================
// Simple test to verify Ollama integration works

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Test Ollama directly
app.get('/api/test-ollama', async (req, res) => {
  try {
    console.log('🤖 Testing Ollama integration...');

    // Test if Ollama is running
    const response = await fetch('http://localhost:11434/api/tags');
    if (!response.ok) {
      throw new Error(`Ollama API not responding: ${response.status}`);
    }

    const models = await response.json();
    console.log('✅ Ollama API responding:', models);

    // Test a simple model
    const testResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3:8b',
        prompt: 'Hello, this is a test from AI-BOS!',
        stream: false
      })
    });

    if (!testResponse.ok) {
      throw new Error(`Ollama generation failed: ${testResponse.status}`);
    }

    const result = await testResponse.json();
    console.log('✅ Ollama generation successful:', result);

    res.json({
      status: 'OK',
      message: 'Ollama integration working!',
      models: models.models,
      testResponse: result.response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Ollama test failed:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      message: 'Ollama integration failed'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AI-BOS Ollama Test Server'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI-BOS Ollama Test Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Ollama test: http://localhost:${PORT}/api/test-ollama`);
});
