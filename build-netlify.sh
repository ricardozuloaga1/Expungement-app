#!/bin/bash

# Netlify build script
echo "🚀 Starting Netlify build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --include=optional --no-fund --no-audit

# Build the application
echo "🔨 Building application..."
npm run build

# Copy static assets to the correct location
echo "📁 Copying static assets..."
cp -r client/public/* dist/public/

# Ensure the functions directory exists
echo "⚡ Setting up Netlify functions..."
mkdir -p netlify/functions

# Copy the API handler
cp netlify/functions/api.js netlify/functions/api.js

echo "✅ Netlify build completed successfully!"
echo "📂 Build output: dist/public"
echo "🔧 Functions: netlify/functions"
