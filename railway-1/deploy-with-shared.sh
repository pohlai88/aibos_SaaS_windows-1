#!/bin/bash

# 🚀 AI-BOS Platform Deployment with Shared Library
# This script builds the shared library and deploys the complete platform

echo "🚀 AI-BOS Platform Deployment with Shared Library"
echo "=================================================="

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
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm first."
        exit 1
    fi
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_success "All requirements met"
}

# Build shared library
build_shared_library() {
    print_status "Building shared library..."
    
    cd ../shared
    
    # Install dependencies
    print_status "Installing shared library dependencies..."
    npm install
    
    # Build the library
    print_status "Building shared library..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Shared library built successfully"
    else
        print_error "Failed to build shared library"
        exit 1
    fi
    
    cd ../railway-1
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Check if already deployed
    if railway status &> /dev/null; then
        print_status "Backend already deployed, updating..."
        railway up
    else
        print_status "Initializing Railway project..."
        railway login
        railway init
        railway up
    fi
    
    # Get the backend URL
    BACKEND_URL=$(railway status | grep "Deployment URL" | awk '{print $3}')
    print_success "Backend deployed: $BACKEND_URL"
    
    cd ..
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Check if already deployed
    if vercel ls &> /dev/null; then
        print_status "Frontend already deployed, updating..."
        vercel --prod
    else
        print_status "Initializing Vercel project..."
        vercel
    fi
    
    # Get the frontend URL
    FRONTEND_URL=$(vercel ls | grep "Production" | awk '{print $2}')
    print_success "Frontend deployed: $FRONTEND_URL"
    
    cd ..
}

# Test the deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Test backend health
    if [ ! -z "$BACKEND_URL" ]; then
        print_status "Testing backend health..."
        curl -s "$BACKEND_URL/health" > /dev/null
        if [ $? -eq 0 ]; then
            print_success "Backend health check passed"
        else
            print_warning "Backend health check failed"
        fi
    fi
    
    # Test frontend
    if [ ! -z "$FRONTEND_URL" ]; then
        print_status "Testing frontend..."
        curl -s "$FRONTEND_URL" > /dev/null
        if [ $? -eq 0 ]; then
            print_success "Frontend is accessible"
        else
            print_warning "Frontend accessibility check failed"
        fi
    fi
}

# Display success message
show_success() {
    echo ""
    echo "🎉 SUCCESS! AI-BOS Platform with Shared Library Deployed!"
    echo "=========================================================="
    echo ""
    echo "🌐 Frontend: $FRONTEND_URL"
    echo "🔧 Backend: $BACKEND_URL"
    echo ""
    echo "📋 What's New with Shared Library Integration:"
    echo "✅ Enhanced authentication with security features"
    echo "✅ Real-time performance monitoring"
    echo "✅ Advanced security and compliance"
    echo "✅ Multi-tenant billing system"
    echo "✅ Event-driven architecture"
    echo "✅ Professional UI components"
    echo "✅ Enterprise-grade logging"
    echo ""
    echo "🚀 Your 'Windows OS for SaaS' is now powered by:"
    echo "   - Advanced AI systems"
    echo "   - Real-time collaboration"
    echo "   - Enterprise security"
    echo "   - Performance monitoring"
    echo "   - Professional UI components"
    echo ""
    echo "📚 Next Steps:"
    echo "1. Open your frontend URL"
    echo "2. Login with demo credentials"
    echo "3. Explore the enhanced features"
    echo "4. Create your first app"
    echo "5. Start onboarding clients"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "- Check logs: railway logs (backend) or vercel logs (frontend)"
    echo "- Restart: railway up (backend) or vercel --prod (frontend)"
    echo "- Shared library: cd ../shared && npm run build"
    echo ""
    echo "🎯 Your dream of a powerful SaaS platform is now reality!"
}

# Main execution
main() {
    echo "Starting AI-BOS Platform deployment with shared library..."
    echo ""
    
    check_requirements
    build_shared_library
    
    echo ""
    print_warning "IMPORTANT: Before continuing, please:"
    echo "1. Set up your Supabase database (see MICRO_DEVELOPER_GUIDE.md)"
    echo "2. Update environment variables in backend/.env and frontend/.env.local"
    echo ""
    read -p "Press Enter when you're ready to deploy..."
    
    deploy_backend
    deploy_frontend
    test_deployment
    show_success
}

# Run the script
main "$@" 