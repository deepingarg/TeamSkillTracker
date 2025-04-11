#!/bin/bash
# This script is called by Vercel during the build phase

# Build frontend with Vite
npm run build

# Copy API files to the build directory
mkdir -p dist/api
cp -r api/* dist/api/

# Ensure correct Node.js configuration for Vercel
echo "engine-strict=true" > .npmrc
echo "node-version=$(node -v)" >> .npmrc