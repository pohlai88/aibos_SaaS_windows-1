#!/bin/bash

# AI-BOS Platform Build and Deploy Script
# This script performs a complete build and deployment of the AI-BOS platform

set -e  # Exit on any error

echo "🚀 Starting AI-BOS Platform Build and Deploy Process..."

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Prerequisites check passed"

# Clean previous builds
print_status "Cleaning previous builds..."

# Clean shared library
if [ -d "shared/dist" ]; then
    rm -rf shared/dist
    print_status "Cleaned shared library dist"
fi

# Clean backend
if [ -d "backend/dist" ]; then
    rm -rf backend/dist
    print_status "Cleaned backend dist"
fi

# Clean frontend
if [ -d "frontend/.next" ]; then
    rm -rf frontend/.next
    print_status "Cleaned frontend .next"
fi

if [ -d "frontend/node_modules/.cache" ]; then
    rm -rf frontend/node_modules/.cache
    print_status "Cleaned frontend cache"
fi

# Clean UI components
if [ -d "shared/ui-components/dist" ]; then
    rm -rf shared/ui-components/dist
    print_status "Cleaned UI components dist"
fi

print_success "Cleanup completed"

# Install dependencies
print_status "Installing dependencies..."

# Install shared library dependencies
print_status "Installing shared library dependencies..."
cd shared
npm ci --silent
print_success "Shared library dependencies installed"

# Install UI components dependencies
print_status "Installing UI components dependencies..."
cd ui-components
npm ci --silent
print_success "UI components dependencies installed"
cd ../..

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm ci --silent
print_success "Backend dependencies installed"
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm ci --silent
print_success "Frontend dependencies installed"
cd ..

print_success "All dependencies installed"

# Build shared library
print_status "Building shared library..."
cd shared
npm run build
print_success "Shared library built"

# Build UI components
print_status "Building UI components..."
cd ui-components
npm run build
print_success "UI components built"
cd ../..

# Build backend
print_status "Building backend..."
cd backend
npm run build
print_success "Backend built"
cd ..

# Build frontend
print_status "Building frontend..."
cd frontend
npm run build
print_success "Frontend built"
cd ..

print_success "All builds completed"

# Run tests
print_status "Running tests..."

# Test shared library
print_status "Testing shared library..."
cd shared
npm test --silent
print_success "Shared library tests passed"

# Test UI components
print_status "Testing UI components..."
cd ui-components
npm test --silent
print_success "UI components tests passed"
cd ../..

# Test backend
print_status "Testing backend..."
cd backend
npm test --silent
print_success "Backend tests passed"
cd ..

# Test frontend
print_status "Testing frontend..."
cd frontend
npm test --silent
print_success "Frontend tests passed"
cd ..

print_success "All tests passed"

# Type checking
print_status "Running type checks..."

# Check shared library types
print_status "Checking shared library types..."
cd shared
npm run typecheck
print_success "Shared library types OK"

# Check UI components types
print_status "Checking UI components types..."
cd ui-components
npm run typecheck
print_success "UI components types OK"
cd ../..

# Check backend types
print_status "Checking backend types..."
cd backend
npm run type-check
print_success "Backend types OK"
cd ..

# Check frontend types
print_status "Checking frontend types..."
cd frontend
npm run type-check
print_success "Frontend types OK"
cd ..

print_success "All type checks passed"

# Linting
print_status "Running linters..."

# Lint shared library
print_status "Linting shared library..."
cd shared
npm run lint
print_success "Shared library linting passed"

# Lint UI components
print_status "Linting UI components..."
cd ui-components
npm run lint
print_success "UI components linting passed"
cd ../..

# Lint backend
print_status "Linting backend..."
cd backend
npm run lint
print_success "Backend linting passed"
cd ..

# Lint frontend
print_status "Linting frontend..."
cd frontend
npm run lint
print_success "Frontend linting passed"
cd ..

print_success "All linting passed"

# Database migration check
print_status "Checking database schema..."
if [ -f "railway-1/supabase-schema.sql" ]; then
    print_success "Database schema file found"
else
    print_warning "Database schema file not found"
fi

# Environment variables check
print_status "Checking environment variables..."

# Check backend environment
if [ -f "railway-1/backend/.env" ]; then
    print_success "Backend environment file found"
else
    print_warning "Backend environment file not found - using .env.example"
    if [ -f "railway-1/backend/env.example" ]; then
        cp railway-1/backend/env.example railway-1/backend/.env
        print_status "Created .env from example"
    fi
fi

# Check frontend environment
if [ -f "railway-1/frontend/.env" ]; then
    print_success "Frontend environment file found"
else
    print_warning "Frontend environment file not found - using .env.example"
    if [ -f "railway-1/frontend/env.example" ]; then
        cp railway-1/frontend/env.example railway-1/frontend/.env
        print_status "Created .env from example"
    fi
fi

# Final status
print_success "🎉 AI-BOS Platform Build and Deploy Process Completed Successfully!"

echo ""
echo "📋 Build Summary:"
echo "  ✅ Shared Library: Built and tested"
echo "  ✅ UI Components: Built and tested"
echo "  ✅ Backend: Built and tested"
echo "  ✅ Frontend: Built and tested"
echo "  ✅ Type Checks: All passed"
echo "  ✅ Linting: All passed"
echo "  ✅ Tests: All passed"
echo ""

echo "🚀 Ready for deployment!"
echo ""
echo "Next steps:"
echo "  1. Review environment variables in .env files"
echo "  2. Deploy to Railway: cd railway-1 && railway up"
echo "  3. Or deploy manually to your preferred platform"
echo ""

print_success "Build process completed successfully!" 