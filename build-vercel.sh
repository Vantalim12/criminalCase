#!/bin/bash
set -e

echo "Building workspace packages for Vercel..."

# Build types package
echo "Building @discover/types..."
cd packages/types
npm install
npm run build
cd ../..

# Build config package
echo "Building @discover/config..."
cd packages/config
npm install
npm run build
cd ../..

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Build complete!"

