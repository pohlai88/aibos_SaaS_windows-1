#!/bin/bash

# 🚀 AI-BOS Quick Start Script
# This script deploys your AI-BOS platform in 5 minutes

echo "🚀 AI-BOS Quick Start - Deploy Your SaaS Platform"
echo "=================================================="

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found. Please install npm first."
        exit 1
    fi
    
    echo "✅ Node.js and npm found"
}

# Install Railway CLI
install_railway() {
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI installation failed"
        exit 1
    fi
    
    echo "✅ Railway CLI installed"
}

# Install Vercel CLI
install_vercel() {
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI installation failed"
        exit 1
    fi
    
    echo "✅ Vercel CLI installed"
}

# Setup environment variables
setup_env() {
    echo "🔧 Setting up environment variables..."
    
    # Create .env files if they don't exist
    if [ ! -f "backend/.env" ]; then
        cp backend/env.example backend/.env
        echo "📝 Created backend/.env (please edit with your values)"
    fi
    
    if [ ! -f "frontend/.env.local" ]; then
        cp frontend/env.example frontend/.env.local
        echo "📝 Created frontend/.env.local (please edit with your values)"
    fi
    
    echo "✅ Environment files created"
}

# Deploy backend to Railway
deploy_backend() {
    echo "🚀 Deploying backend to Railway..."
    
    cd backend
    
    # Check if already deployed
    if railway status &> /dev/null; then
        echo "🔄 Backend already deployed, updating..."
        railway up
    else
        echo "🆕 Initializing Railway project..."
        railway login
        railway init
        railway up
    fi
    
    # Get the backend URL
    BACKEND_URL=$(railway status | grep "Deployment URL" | awk '{print $3}')
    echo "✅ Backend deployed: $BACKEND_URL"
    
    cd ..
}

# Deploy frontend to Vercel
deploy_frontend() {
    echo "🚀 Deploying frontend to Vercel..."
    
    cd frontend
    
    # Check if already deployed
    if vercel ls &> /dev/null; then
        echo "🔄 Frontend already deployed, updating..."
        vercel --prod
    else
        echo "🆕 Initializing Vercel project..."
        vercel
    fi
    
    # Get the frontend URL
    FRONTEND_URL=$(vercel ls | grep "Production" | awk '{print $2}')
    echo "✅ Frontend deployed: $FRONTEND_URL"
    
    cd ..
}

# Create sample app
create_sample_app() {
    echo "📝 Creating sample task app..."
    
    if [ ! -d "app-templates" ]; then
        mkdir app-templates
    fi
    
    # Copy the sample app template
    cp simple-task-app.json app-templates/ 2>/dev/null || echo "Sample app template already exists"
    
    echo "✅ Sample app template created"
}

# Display success message
show_success() {
    echo ""
    echo "🎉 SUCCESS! Your AI-BOS platform is deployed!"
    echo "============================================="
    echo ""
    echo "🌐 Frontend: $FRONTEND_URL"
    echo "🔧 Backend: $BACKEND_URL"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Open your frontend URL"
    echo "2. Click 'Demo Login' to test"
    echo "3. Try the demo apps (Accounting, Tax Calculator)"
    echo "4. Create your first app using the template"
    echo ""
    echo "📚 Documentation:"
    echo "- Quick Start Guide: MICRO_DEVELOPER_GUIDE.md"
    echo "- Sample App: app-templates/simple-task-app.json"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "- Check logs: railway logs (backend) or vercel logs (frontend)"
    echo "- Restart: railway up (backend) or vercel --prod (frontend)"
    echo ""
    echo "🚀 Your dream of publishing apps is now reality!"
}

# Main execution
main() {
    echo "Starting AI-BOS deployment..."
    echo ""
    
    check_requirements
    install_railway
    install_vercel
    setup_env
    
    echo ""
    echo "⚠️  IMPORTANT: Before continuing, please:"
    echo "1. Set up your Supabase database (see MICRO_DEVELOPER_GUIDE.md)"
    echo "2. Update environment variables in backend/.env and frontend/.env.local"
    echo ""
    read -p "Press Enter when you're ready to deploy..."
    
    deploy_backend
    deploy_frontend
    create_sample_app
    show_success
}

# Run the script
main "$@" 