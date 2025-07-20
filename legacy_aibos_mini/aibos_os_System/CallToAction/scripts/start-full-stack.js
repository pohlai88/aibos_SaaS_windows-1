/**
 * Full Stack Startup Script
 * Starts both the API server and serves the web interface
 */

const express = require('express');
const path = require('path');
const APIServer = require('../interfaces/api/server');

class FullStackServer {
    constructor() {
        this.app = express();
        this.apiServer = new APIServer();
        this.port = process.env.PORT || 3000;
        
        this.setupWebInterface();
        this.setupAPI();
    }

    setupWebInterface() {
        // Serve static files from the web interface
        this.app.use(express.static(path.join(__dirname, '../interfaces/web')));
        
        // Serve the main HTML file for all routes (SPA)
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../interfaces/web/index.html'));
        });
    }

    setupAPI() {
        // Mount the API server
        this.app.use('/api', this.apiServer.app);
    }

    async start() {
        try {
            // Start the server
            this.server = this.app.listen(this.port, () => {
                console.log('🚀 AI-BOS OS Full Stack Server Started!');
                console.log(`📱 Web Interface: http://localhost:${this.port}`);
                console.log(`🔌 API Endpoint: http://localhost:${this.port}/api`);
                console.log(`📊 Health Check: http://localhost:${this.port}/api/health`);
                console.log('');
                console.log('✨ Features Available:');
                console.log('   • Modern Web Interface');
                console.log('   • Module Upload & Management');
                console.log('   • Drag & Drop File Upload');
                console.log('   • Real-time System Monitoring');
                console.log('   • RESTful API');
                console.log('');
                console.log('🎯 Ready for development!');
            });

        } catch (error) {
            console.error('❌ Failed to start full stack server:', error);
            process.exit(1);
        }
    }

    async stop() {
        if (this.server) {
            this.server.close();
            console.log('🛑 Full Stack Server stopped');
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (global.fullStackServer) {
        await global.fullStackServer.stop();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (global.fullStackServer) {
        await global.fullStackServer.stop();
    }
    process.exit(0);
});

// Start the server
if (require.main === module) {
    const server = new FullStackServer();
    global.fullStackServer = server;
    server.start();
}

module.exports = FullStackServer; 