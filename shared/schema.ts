import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the skill level enum
export enum SkillLevel {
  Unknown = 0,
  BasicKnowledge = 1,
  HandsOnExperience = 2,
  Expert = 3
}

// Users table (kept for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// TeamMembers table
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  initials: text("initials").notNull(),
  avatarColor: text("avatar_color").notNull(), // For random color
});

// Skills table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(), // Icon name from Remix Icons
  iconColor: text("icon_color").notNull(), // For color customization
});

// Weekly snapshots table
export const weeklySnapshots = pgTable("weekly_snapshots", {
  id: serial("id").primaryKey(),
  weekOf: timestamp("week_of").notNull(), // Start date of the week
  isCurrentWeek: boolean("is_current_week").notNull().default(false),
});

// Skill assessments table
export const skillAssessments = pgTable("skill_assessments", {
  id: serial("id").primaryKey(),
  teamMemberId: integer("team_member_id").notNull().references(() => teamMembers.id, { onDelete: 'cascade' }),
  skillId: integer("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  snapshotId: integer("snapshot_id").notNull().references(() => weeklySnapshots.id, { onDelete: 'cascade' }),
  level: integer("level").notNull().default(0), // 0: Unknown, 1: Basic, 2: Hands-on, 3: Expert
});

// Settings table for app configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: json("value").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers);
export const insertSkillSchema = createInsertSchema(skills);
export const insertWeeklySnapshotSchema = createInsertSchema(weeklySnapshots).omit({ isCurrentWeek: true });
export const insertSkillAssessmentSchema = createInsertSchema(skillAssessments);
export const insertSettingsSchema = createInsertSchema(settings);

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type InsertWeeklySnapshot = z.infer<typeof insertWeeklySnapshotSchema>;
export type InsertSkillAssessment = z.infer<typeof insertSkillAssessmentSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Select types
export type User = typeof users.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type WeeklySnapshot = typeof weeklySnapshots.$inferSelect;
export type SkillAssessment = typeof skillAssessments.$inferSelect;
export type Settings = typeof settings.$inferSelect;

// Extended types for frontend use
export type SkillWithAssessment = Skill & {
  level: number;
  previousLevel?: number;
  growth?: number;
};

export type TeamMemberWithSkills = TeamMember & {
  skills: SkillWithAssessment[];
};

export type SkillWithStats = Skill & {
  averageLevel: number;
  growth: number;
  teamMembers: number;
};

export type SkillMatrixData = {
  members: TeamMember[];
  skills: Skill[];
  assessments: Record<string, Record<string, number>>;
};

export type WeeklyComparisonData = {
  skills: Skill[];
  currentWeek: number[];
  previousWeek: number[];
};

export type GrowthPerSkillData = {
  snapshots: WeeklySnapshot[];
  skills: Skill[];
  data: Record<number, number[]>;
};
