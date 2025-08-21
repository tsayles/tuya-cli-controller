#!/bin/bash
# Development setup script for Tuya Device Controller

set -e

echo "🔧 Setting up Tuya Device Controller for development"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 20 or higher."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

# Run initial build to verify setup
echo "🏗️  Running initial build..."
npm run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check for errors above."
    exit 1
fi

echo ""
echo "🎉 Development setup complete!"
echo ""
echo "📝 Available commands:"
echo "   npm run dev      - Start development server"
echo "   npm run build    - Build for production"
echo "   npm run lint     - Run linter"
echo "   npm run preview  - Preview production build"
echo ""
echo "🚀 To start developing:"
echo "   npm run dev"
echo ""
echo "🐳 Docker development:"
echo "   docker-compose --profile dev up"