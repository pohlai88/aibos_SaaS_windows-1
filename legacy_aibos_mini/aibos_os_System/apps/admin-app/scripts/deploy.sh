#!/bin/bash

# Aibos Admin App Deployment Script
# Usage: ./scripts/deploy.sh [platform]

set -e

PLATFORM=${1:-vercel}

echo "🚀 Deploying Aibos Admin App to $PLATFORM..."

# Build the project
echo "📦 Building project..."
npm run build

case $PLATFORM in
  "vercel")
    echo "🌐 Deploying to Vercel..."
    if command -v vercel &> /dev/null; then
      vercel --prod
    else
      echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
      exit 1
    fi
    ;;
  "netlify")
    echo "🌐 Deploying to Netlify..."
    if command -v netlify &> /dev/null; then
      netlify deploy --prod --dir=.next
    else
      echo "❌ Netlify CLI not found. Install with: npm i -g netlify-cli"
      exit 1
    fi
    ;;
  "docker")
    echo "🐳 Building Docker image..."
    docker build -t aibos-admin .
    echo "✅ Docker image built successfully!"
    echo "Run with: docker run -p 3000:3000 aibos-admin"
    ;;
  "docker-compose")
    echo "🐳 Deploying with Docker Compose..."
    docker-compose up -d --build
    echo "✅ Deployed with Docker Compose!"
    echo "Access at: http://localhost:3000"
    ;;
  *)
    echo "❌ Unknown platform: $PLATFORM"
    echo "Available platforms: vercel, netlify, docker, docker-compose"
    exit 1
    ;;
esac

echo "✅ Deployment completed successfully!" 