/**
 * Web Interface Server
 * Serves only the web interface (for development)
 */

const express = require('express');
const path = require('path');

const app = express();
const port = process.env.WEB_PORT || 8080;

// Serve static files
app.use(express.static(path.join(__dirname, '../interfaces/web')));

// Serve the main HTML file for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../interfaces/web/index.html'));
});

app.listen(port, () => {
    console.log('🌐 AI-BOS OS Web Interface Server');
    console.log(`📱 Web Interface: http://localhost:${port}`);
    console.log('');
    console.log('⚠️  Note: This is web-only mode. API server is not running.');
    console.log('   Use "npm start" for full stack (web + API)');
    console.log('   Use "npm run api" for API-only mode');
}); 