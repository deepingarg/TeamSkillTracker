// This is a CommonJS module
// Import required modules
const express = require('express');
const { createServer } = require('http');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const ws = require('ws');

// Dynamically import ESM modules using a workaround
let registerRoutes;
import('../server/routes.ts').then(module => {
  registerRoutes = module.registerRoutes;
});

// Initialize Express app
const app = express();

// Configure middleware for JSON parsing, etc.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vercel-specific handler
module.exports = async (req, res) => {
  // Pass the request to the Express app
  return new Promise(async (resolve) => {
    try {
      // Configure the database
      const { neonConfig } = require('@neondatabase/serverless');
      neonConfig.webSocketConstructor = ws;
      
      // Ensure the DATABASE_URL environment variable is set
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL must be set.');
      }
      
      // Connect to the database
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      // Load schema
      const schema = require('../shared/schema');
      
      // Initialize Drizzle
      global.db = drizzle({ client: pool, schema });
      
      // Register API routes
      await registerRoutes(app);
      
      // Pass the request to the Express app
      app(req, res);
      
      // When the response is finished, resolve the promise
      res.on('finish', () => {
        resolve();
      });
    } catch (error) {
      console.error('Error in serverless function:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      resolve();
    }
  });
};