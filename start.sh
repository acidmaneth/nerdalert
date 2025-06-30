#!/bin/bash

# NerdAlert Startup Script
# This script helps you get started with the NerdAlert project

echo "🚀 Starting NerdAlert..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js version 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install:all
fi

# Check if environment files exist
if [ ! -f "client/.env" ]; then
    echo "⚠️  Client environment file not found. Creating from example..."
    cp client/env.example client/.env
    echo "📝 Please edit client/.env with your configuration"
fi

if [ ! -f "server/.env" ]; then
    echo "⚠️  Server environment file not found. Creating from example..."
    cp server/env.example server/.env
    echo "📝 Please edit server/.env with your API keys"
fi

# Start the development servers
echo "🎮 Starting development servers..."
echo "   Backend: http://localhost:80"
echo "   Frontend: http://localhost:5050"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

npm run dev 