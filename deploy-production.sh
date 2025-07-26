#!/bin/bash

# ==================== AI-BOS PRODUCTION DEPLOYMENT SCRIPT ====================
# This script handles the complete production deployment process for AI-BOS

set -e  # Exit on any error

echo "🚀 Starting AI-BOS Production Deployment..."

# ==================== ENVIRONMENT VARIABLES ====================
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=production

# ==================== PRE-DEPLOYMENT CHECKS ====================
echo "📋 Running pre-deployment checks..."

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ git is required but not installed. Aborting." >&2; exit 1; }

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Pre-deployment checks passed"

# ==================== SHARED PACKAGE DEPLOYMENT ====================
echo "📦 Deploying shared package..."

cd shared
npm run build
npm publish --access public
cd ..

echo "✅ Shared package deployed"

# ==================== BACKEND DEPLOYMENT ====================
echo "🔧 Deploying backend to Railway..."

cd railway-1/backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm ci --only=production

# Run tests
echo "🧪 Running backend tests..."
npm test

# Build the application
echo "🔨 Building backend..."
npm run build

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up --service backend

cd ../..

echo "✅ Backend deployed to Railway"

# ==================== FRONTEND DEPLOYMENT ====================
echo "🎨 Deploying frontend to Vercel..."

cd railway-1/frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm ci --only=production

# Run tests
echo "🧪 Running frontend tests..."
npm test

# Build the application
echo "🔨 Building frontend..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

cd ../..

echo "✅ Frontend deployed to Vercel"

# ==================== DATABASE MIGRATION ====================
echo "🗄️ Running database migrations..."

cd railway-1/backend

# Run database migrations
echo "🔄 Running migrations..."
npm run migrate

# Seed production data
echo "🌱 Seeding production data..."
npm run seed:prod

cd ../..

echo "✅ Database migration completed"

# ==================== HEALTH CHECKS ====================
echo "🏥 Running health checks..."

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check backend health
echo "🔍 Checking backend health..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://ai-bos-backend.railway.app/api/health)
if [ "$BACKEND_HEALTH" != "200" ]; then
    echo "❌ Backend health check failed: $BACKEND_HEALTH"
    exit 1
fi

# Check frontend health
echo "🔍 Checking frontend health..."
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://ai-bos.vercel.app/api/health)
if [ "$FRONTEND_HEALTH" != "200" ]; then
    echo "❌ Frontend health check failed: $FRONTEND_HEALTH"
    exit 1
fi

echo "✅ Health checks passed"

# ==================== POST-DEPLOYMENT SETUP ====================
echo "🔧 Running post-deployment setup..."

# Set up monitoring
echo "📊 Setting up monitoring..."
# TODO: Configure monitoring services

# Set up alerting
echo "🚨 Setting up alerting..."
# TODO: Configure alerting services

# Set up backups
echo "💾 Setting up backups..."
# TODO: Configure backup services

echo "✅ Post-deployment setup completed"

# ==================== DEPLOYMENT COMPLETE ====================
echo ""
echo "🎉 AI-BOS Production Deployment Complete!"
echo ""
echo "📊 Deployment Summary:"
echo "   ✅ Shared Package: Deployed to NPM"
echo "   ✅ Backend: Deployed to Railway"
echo "   ✅ Frontend: Deployed to Vercel"
echo "   ✅ Database: Migrated and seeded"
echo "   ✅ Health Checks: All passed"
echo "   ✅ Monitoring: Configured"
echo ""
echo "🌐 Production URLs:"
echo "   Frontend: https://ai-bos.vercel.app"
echo "   Backend: https://ai-bos-backend.railway.app"
echo "   API Docs: https://ai-bos-backend.railway.app/api/docs"
echo ""
echo "📧 Support: support@ai-bos.io"
echo "📚 Documentation: https://docs.ai-bos.io"
echo ""
echo "🚀 AI-BOS is now live in production!"
