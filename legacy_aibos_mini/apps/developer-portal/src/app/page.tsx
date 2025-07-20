import React from 'react';

export default function DeveloperPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            AI-BOS Developer Portal
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Welcome to the AI-BOS OS Developer Portal
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Module Development</h3>
              <p className="text-gray-300 mb-4">
                Create and deploy custom modules for the AI-BOS ecosystem
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                Get Started
              </button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">API Documentation</h3>
              <p className="text-gray-300 mb-4">
                Explore the comprehensive API documentation
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                View Docs
              </button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">SDK Downloads</h3>
              <p className="text-gray-300 mb-4">
                Download SDKs and development tools
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 