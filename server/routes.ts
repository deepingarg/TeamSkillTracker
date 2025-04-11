import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertTeamMemberSchema, 
  insertSkillSchema, 
  insertWeeklySnapshotSchema,
  insertSkillAssessmentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize demo data
  await storage.initDemoData();

  // Team Members API
  app.get("/api/team-members", async (req, res) => {
    const teamMembers = await storage.getTeamMembers();
    res.json(teamMembers);
  });

  app.get("/api/team-members/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const teamMember = await storage.getTeamMember(id);
    
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }
    
    res.json(teamMember);
  });

  app.post("/api/team-members", async (req, res) => {
    try {
      const teamMember = insertTeamMemberSchema.parse(req.body);
      const newTeamMember = await storage.createTeamMember(teamMember);
      res.status(201).json(newTeamMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team member data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  app.patch("/api/team-members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const teamMember = insertTeamMemberSchema.partial().parse(req.body);
      const updatedTeamMember = await storage.updateTeamMember(id, teamMember);
      
      if (!updatedTeamMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(updatedTeamMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team member data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  app.delete("/api/team-members/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteTeamMember(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Team member not found" });
    }
    
    res.status(204).end();
  });

  // Skills API
  app.get("/api/skills", async (req, res) => {
    const skills = await storage.getSkills();
    res.json(skills);
  });

  app.get("/api/skills/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const skill = await storage.getSkill(id);
    
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    
    res.json(skill);
  });

  app.post("/api/skills", async (req, res) => {
    try {
      const skill = insertSkillSchema.parse(req.body);
      const newSkill = await storage.createSkill(skill);
      res.status(201).json(newSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid skill data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.patch("/api/skills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const skill = insertSkillSchema.partial().parse(req.body);
      const updatedSkill = await storage.updateSkill(id, skill);
      
      if (!updatedSkill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(updatedSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid skill data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete("/api/skills/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteSkill(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Skill not found" });
    }
    
    res.status(204).end();
  });

  // Weekly Snapshots API
  app.get("/api/snapshots", async (req, res) => {
    const snapshots = await storage.getWeeklySnapshots();
    res.json(snapshots);
  });

  app.get("/api/snapshots/current", async (req, res) => {
    const snapshot = await storage.getCurrentWeeklySnapshot();
    
    if (!snapshot) {
      return res.status(404).json({ message: "No current snapshot found" });
    }
    
    res.json(snapshot);
  });

  app.get("/api/snapshots/previous", async (req, res) => {
    const snapshot = await storage.getPreviousWeeklySnapshot();
    
    if (!snapshot) {
      return res.status(404).json({ message: "No previous snapshot found" });
    }
    
    res.json(snapshot);
  });

  app.post("/api/snapshots", async (req, res) => {
    try {
      const snapshot = insertWeeklySnapshotSchema.parse(req.body);
      const setCurrent = req.query.setCurrent === "true";
      const newSnapshot = await storage.createWeeklySnapshot(snapshot, setCurrent);
      res.status(201).json(newSnapshot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid snapshot data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create snapshot" });
    }
  });

  // Skill Assessments API
  app.get("/api/assessments", async (req, res) => {
    const assessments = await storage.getSkillAssessments();
    res.json(assessments);
  });

  app.get("/api/assessments/snapshot/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const assessments = await storage.getSkillAssessmentsBySnapshot(id);
    res.json(assessments);
  });

  app.get("/api/assessments/team-member/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const assessments = await storage.getSkillAssessmentsByTeamMember(id);
    res.json(assessments);
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      const assessment = insertSkillAssessmentSchema.parse(req.body);
      const newAssessment = await storage.createSkillAssessment(assessment);
      res.status(201).json(newAssessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  app.patch("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = insertSkillAssessmentSchema.partial().parse(req.body);
      const updatedAssessment = await storage.updateSkillAssessment(id, assessment);
      
      if (!updatedAssessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(updatedAssessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });

  // Aggregation APIs
  app.get("/api/skill-matrix", async (req, res) => {
    const matrix = await storage.getSkillMatrix();
    res.json(matrix);
  });

  app.get("/api/weekly-comparison", async (req, res) => {
    const comparison = await storage.getWeeklyComparison();
    res.json(comparison);
  });

  app.get("/api/growth-per-skill", async (req, res) => {
    const growth = await storage.getGrowthPerSkill();
    res.json(growth);
  });

  app.get("/api/team-stats", async (req, res) => {
    const stats = await storage.getTeamStats();
    res.json(stats);
  });

  app.get("/api/top-skills", async (req, res) => {
    const topSkills = await storage.getTopSkills();
    res.json(topSkills);
  });
  
  // Reports API
  app.get("/api/reports/weekly", async (req, res) => {
    try {
      const report = await storage.generateWeeklyReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating weekly report:", error);
      res.status(500).json({ message: "Failed to generate weekly report" });
    }
  });
  
  app.get("/api/reports/monthly", async (req, res) => {
    try {
      const report = await storage.generateMonthlyReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating monthly report:", error);
      res.status(500).json({ message: "Failed to generate monthly report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
