#!/bin/bash

# AI-BOS Platform Deployment Script
# This script helps deploy the backend to Railway and frontend to Vercel

set -e

echo "🚀 AI-BOS Platform Deployment Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Deploy backend to Railway
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Deploy to Railway
    print_status "Deploying to Railway..."
    railway up --detach
    
    # Get the deployment URL
    BACKEND_URL=$(railway status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$BACKEND_URL" ]; then
        print_error "Failed to get Railway deployment URL"
        exit 1
    fi
    
    print_success "Backend deployed to: $BACKEND_URL"
    
    # Set environment variables
    print_status "Setting environment variables..."
    railway variables set JWT_SECRET="aibos-super-secret-key-$(date +%s)"
    railway variables set NODE_ENV=production
    
    cd ..
    
    echo $BACKEND_URL > .backend_url
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Read backend URL
    if [ -f "../.backend_url" ]; then
        BACKEND_URL=$(cat ../.backend_url)
        print_status "Using backend URL: $BACKEND_URL"
    else
        print_warning "Backend URL not found. Please enter it manually:"
        read -p "Backend URL: " BACKEND_URL
    fi
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > .env.local
    vercel --prod --yes
    
    cd ..
}

# Main deployment function
main() {
    print_status "Starting AI-BOS Platform deployment..."
    
    # Check dependencies
    check_dependencies
    
    # Deploy backend first
    deploy_backend
    
    # Deploy frontend
    deploy_frontend
    
    print_success "🎉 AI-BOS Platform deployment completed!"
    print_status "Backend: $(cat .backend_url 2>/dev/null || echo 'Check Railway dashboard')"
    print_status "Frontend: Check Vercel dashboard for URL"
    print_status ""
    print_status "Demo credentials:"
    print_status "  Email: admin@demo.com"
    print_status "  Password: any password"
}

# Run main function
main "$@" 