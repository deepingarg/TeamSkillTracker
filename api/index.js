// Vercel serverless API handler
const express = require('express');
const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Initialize Express app
const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a simple API handler
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Setup database connection
const setupDbConnection = () => {
  const { neonConfig } = require('@neondatabase/serverless');
  neonConfig.webSocketConstructor = ws;
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  return new Pool({ connectionString: process.env.DATABASE_URL });
};

// Setup routes for our API
app.get('/api/skills', async (req, res) => {
  try {
    const pool = setupDbConnection();
    const { rows } = await pool.query('SELECT * FROM skills');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

app.get('/api/team-members', async (req, res) => {
  try {
    const pool = setupDbConnection();
    const { rows } = await pool.query('SELECT * FROM team_members');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Weekly report generation endpoint
app.get('/api/reports/weekly', async (req, res) => {
  try {
    const pool = setupDbConnection();
    
    // Get current and previous snapshots
    const currentSnapshot = await pool.query('SELECT * FROM weekly_snapshots WHERE is_current_week = true LIMIT 1');
    const previousSnapshot = await pool.query('SELECT * FROM weekly_snapshots WHERE is_current_week = false ORDER BY week_of DESC LIMIT 1');
    
    // Get team statistics
    const teamStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM team_members) as team_size,
        (SELECT COUNT(*) FROM skills) as total_skills,
        COALESCE((
          SELECT AVG(level)::float 
          FROM skill_assessments 
          WHERE snapshot_id = $1
        ), 0) as avg_skill_level
    `, [currentSnapshot.rows[0]?.id]);
    
    // Get top skills
    const topSkills = await pool.query(`
      SELECT 
        s.id, 
        s.name, 
        s.icon,
        s.icon_color,
        COALESCE(AVG(sa.level)::float, 0) as average_level,
        CASE 
          WHEN prev_avg.avg_level IS NULL OR prev_avg.avg_level = 0 THEN 0
          ELSE ((COALESCE(AVG(sa.level)::float, 0) - prev_avg.avg_level) / prev_avg.avg_level) * 100
        END as growth
      FROM 
        skills s
      LEFT JOIN skill_assessments sa ON s.id = sa.skill_id AND sa.snapshot_id = $1
      LEFT JOIN (
        SELECT 
          skill_id, 
          COALESCE(AVG(level)::float, 0) as avg_level 
        FROM 
          skill_assessments 
        WHERE 
          snapshot_id = $2
        GROUP BY 
          skill_id
      ) prev_avg ON s.id = prev_avg.skill_id
      GROUP BY 
        s.id, s.name, s.icon, s.icon_color, prev_avg.avg_level
      ORDER BY 
        average_level DESC
    `, [currentSnapshot.rows[0]?.id, previousSnapshot.rows[0]?.id]);
    
    // Create the weekly report
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Get skills with growth > 0, sorted by growth
    const growthSkills = topSkills.rows
      .filter(skill => skill.growth > 0)
      .sort((a, b) => b.growth - a.growth)
      .map(skill => ({
        id: skill.id,
        name: skill.name,
        growth: skill.growth
      }));
    
    // Get skills with no growth
    const noProgressSkills = topSkills.rows
      .filter(skill => skill.growth === 0)
      .map(skill => ({
        id: skill.id,
        name: skill.name
      }));
    
    // Format the top skills for the report
    const formattedTopSkills = topSkills.rows
      .slice(0, 10) // Get top 10 skills
      .map(skill => ({
        id: skill.id,
        name: skill.name,
        averageLevel: skill.average_level,
        growth: skill.growth
      }));
    
    const report = {
      generatedAt: now.toISOString(),
      reportType: 'weekly',
      period: {
        start: weekAgo.toISOString(),
        end: now.toISOString()
      },
      teamSize: teamStats.rows[0]?.team_size || 0,
      totalSkills: teamStats.rows[0]?.total_skills || 0,
      avgSkillLevel: teamStats.rows[0]?.avg_skill_level || 0,
      growthAreas: growthSkills.length,
      stagnantAreas: noProgressSkills.length,
      topSkills: formattedTopSkills,
      highestGrowth: growthSkills.slice(0, 5), // Top 5 growth skills
      noProgress: noProgressSkills.slice(0, 5) // Top 5 stagnant skills
    };
    
    res.json(report);
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

// Export the serverless function handler
module.exports = (req, res) => {
  // Match all API routes
  if (req.url.startsWith('/api/')) {
    return app(req, res);
  }
  
  // For non-API routes, default to the frontend
  res.status(404).json({ error: 'Not Found' });
};