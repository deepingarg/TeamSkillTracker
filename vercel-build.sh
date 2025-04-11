#!/bin/bash
# This script is called by Vercel during the build phase

# Build frontend with Vite
npm run build

# Copy API files to the build directory
mkdir -p dist/api
cp -r api/* dist/api/

# Create a .vercel directory with configuration for development
mkdir -p .vercel
echo '{
  "version": 2,
  "public": true,
  "github": {
    "silent": true
  }
}' > .vercel/project.json

# Create a README file for Vercel deployment
echo '# Team Skills Management App

This application is deployed on Vercel.

## Configuration Requirements

Make sure to set the following environment variables in your Vercel project:

- `DATABASE_URL`: Connection string for your PostgreSQL database (Neon)
- `NODE_ENV`: Set to "production" for deployment

## Frontend

The frontend is built with React, Vite, and Tailwind CSS.

## API

The API is implemented as a Vercel serverless function and connects to a PostgreSQL database.
' > README.md