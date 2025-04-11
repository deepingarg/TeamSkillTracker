import { 
  users, type User, type InsertUser,
  teamMembers, type TeamMember, type InsertTeamMember,
  skills, type Skill, type InsertSkill,
  weeklySnapshots, type WeeklySnapshot, type InsertWeeklySnapshot,
  skillAssessments, type SkillAssessment, type InsertSkillAssessment,
  settings, type Settings, type InsertSettings,
  type SkillMatrixData, type WeeklyComparisonData, type GrowthPerSkillData,
  SkillLevel
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Team Member methods
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, teamMember: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;
  
  // Skill methods
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Weekly Snapshot methods
  getWeeklySnapshots(): Promise<WeeklySnapshot[]>;
  getCurrentWeeklySnapshot(): Promise<WeeklySnapshot | undefined>;
  getPreviousWeeklySnapshot(): Promise<WeeklySnapshot | undefined>;
  createWeeklySnapshot(snapshot: InsertWeeklySnapshot, setCurrent?: boolean): Promise<WeeklySnapshot>;
  
  // Skill Assessment methods
  getSkillAssessments(): Promise<SkillAssessment[]>;
  getSkillAssessmentsBySnapshot(snapshotId: number): Promise<SkillAssessment[]>;
  getSkillAssessmentsByTeamMember(teamMemberId: number): Promise<SkillAssessment[]>;
  createSkillAssessment(assessment: InsertSkillAssessment): Promise<SkillAssessment>;
  updateSkillAssessment(id: number, assessment: Partial<InsertSkillAssessment>): Promise<SkillAssessment | undefined>;
  
  // Settings methods
  getSetting(key: string): Promise<Settings | undefined>;
  updateSetting(key: string, value: any): Promise<Settings>;
  
  // Aggregation methods
  getSkillMatrix(): Promise<SkillMatrixData>;
  getWeeklyComparison(): Promise<WeeklyComparisonData>;
  getGrowthPerSkill(): Promise<GrowthPerSkillData>;
  getTeamStats(): Promise<{
    teamSize: number;
    totalSkills: number;
    avgSkillLevel: number;
    growthAreas: number;
    stagnantAreas: number;
  }>;
  getTopSkills(): Promise<{
    id: number;
    name: string;
    icon: string;
    iconColor: string;
    averageLevel: number;
    growth: number;
  }[]>;
  
  // Initialize with demo data (for development)
  initDemoData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teamMembers: Map<number, TeamMember>;
  private skills: Map<number, Skill>;
  private weeklySnapshots: Map<number, WeeklySnapshot>;
  private skillAssessments: Map<number, SkillAssessment>;
  private settings: Map<string, Settings>;
  
  private userId: number;
  private teamMemberId: number;
  private skillId: number;
  private snapshotId: number;
  private assessmentId: number;
  private settingsId: number;
  
  constructor() {
    this.users = new Map();
    this.teamMembers = new Map();
    this.skills = new Map();
    this.weeklySnapshots = new Map();
    this.skillAssessments = new Map();
    this.settings = new Map();
    
    this.userId = 1;
    this.teamMemberId = 1;
    this.skillId = 1;
    this.snapshotId = 1;
    this.assessmentId = 1;
    this.settingsId = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Team Member methods
  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }
  
  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }
  
  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberId++;
    const newTeamMember: TeamMember = { ...teamMember, id };
    this.teamMembers.set(id, newTeamMember);
    return newTeamMember;
  }
  
  async updateTeamMember(id: number, teamMember: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const existing = this.teamMembers.get(id);
    if (!existing) return undefined;
    
    const updated: TeamMember = { ...existing, ...teamMember };
    this.teamMembers.set(id, updated);
    return updated;
  }
  
  async deleteTeamMember(id: number): Promise<boolean> {
    const deleted = this.teamMembers.delete(id);
    
    // Delete related assessments
    for (const [assessmentId, assessment] of this.skillAssessments.entries()) {
      if (assessment.teamMemberId === id) {
        this.skillAssessments.delete(assessmentId);
      }
    }
    
    return deleted;
  }
  
  // Skill methods
  async getSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }
  
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }
  
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.skillId++;
    const newSkill: Skill = { ...skill, id };
    this.skills.set(id, newSkill);
    return newSkill;
  }
  
  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined> {
    const existing = this.skills.get(id);
    if (!existing) return undefined;
    
    const updated: Skill = { ...existing, ...skill };
    this.skills.set(id, updated);
    return updated;
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    const deleted = this.skills.delete(id);
    
    // Delete related assessments
    for (const [assessmentId, assessment] of this.skillAssessments.entries()) {
      if (assessment.skillId === id) {
        this.skillAssessments.delete(assessmentId);
      }
    }
    
    return deleted;
  }
  
  // Weekly Snapshot methods
  async getWeeklySnapshots(): Promise<WeeklySnapshot[]> {
    // Sort by date descending
    return Array.from(this.weeklySnapshots.values()).sort((a, b) => 
      new Date(b.weekOf).getTime() - new Date(a.weekOf).getTime()
    );
  }
  
  async getCurrentWeeklySnapshot(): Promise<WeeklySnapshot | undefined> {
    return Array.from(this.weeklySnapshots.values()).find(s => s.isCurrentWeek);
  }
  
  async getPreviousWeeklySnapshot(): Promise<WeeklySnapshot | undefined> {
    const current = await this.getCurrentWeeklySnapshot();
    if (!current) return undefined;
    
    const snapshots = await this.getWeeklySnapshots();
    const currentIndex = snapshots.findIndex(s => s.id === current.id);
    
    return currentIndex < snapshots.length - 1 ? snapshots[currentIndex + 1] : undefined;
  }
  
  async createWeeklySnapshot(snapshot: InsertWeeklySnapshot, setCurrent = false): Promise<WeeklySnapshot> {
    const id = this.snapshotId++;
    
    // If setting as current, unset any existing current
    if (setCurrent) {
      for (const [snapId, snap] of this.weeklySnapshots.entries()) {
        if (snap.isCurrentWeek) {
          this.weeklySnapshots.set(snapId, { ...snap, isCurrentWeek: false });
        }
      }
    }
    
    const newSnapshot: WeeklySnapshot = { 
      ...snapshot, 
      id, 
      isCurrentWeek: setCurrent 
    };
    this.weeklySnapshots.set(id, newSnapshot);
    return newSnapshot;
  }
  
  // Skill Assessment methods
  async getSkillAssessments(): Promise<SkillAssessment[]> {
    return Array.from(this.skillAssessments.values());
  }
  
  async getSkillAssessmentsBySnapshot(snapshotId: number): Promise<SkillAssessment[]> {
    return Array.from(this.skillAssessments.values()).filter(
      a => a.snapshotId === snapshotId
    );
  }
  
  async getSkillAssessmentsByTeamMember(teamMemberId: number): Promise<SkillAssessment[]> {
    return Array.from(this.skillAssessments.values()).filter(
      a => a.teamMemberId === teamMemberId
    );
  }
  
  async createSkillAssessment(assessment: InsertSkillAssessment): Promise<SkillAssessment> {
    // Check if an assessment already exists for this member, skill, and snapshot
    const existing = Array.from(this.skillAssessments.values()).find(
      a => a.teamMemberId === assessment.teamMemberId && 
           a.skillId === assessment.skillId && 
           a.snapshotId === assessment.snapshotId
    );
    
    if (existing) {
      // Update instead of creating new
      existing.level = assessment.level;
      return existing;
    }
    
    const id = this.assessmentId++;
    const newAssessment: SkillAssessment = { ...assessment, id };
    this.skillAssessments.set(id, newAssessment);
    return newAssessment;
  }
  
  async updateSkillAssessment(id: number, assessment: Partial<InsertSkillAssessment>): Promise<SkillAssessment | undefined> {
    const existing = this.skillAssessments.get(id);
    if (!existing) return undefined;
    
    const updated: SkillAssessment = { ...existing, ...assessment };
    this.skillAssessments.set(id, updated);
    return updated;
  }
  
  // Settings methods
  async getSetting(key: string): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(s => s.key === key);
  }
  
  async updateSetting(key: string, value: any): Promise<Settings> {
    const existing = await this.getSetting(key);
    
    if (existing) {
      const updated: Settings = { ...existing, value };
      this.settings.set(existing.id.toString(), updated);
      return updated;
    } else {
      const id = this.settingsId++;
      const newSetting: Settings = { id, key, value };
      this.settings.set(id.toString(), newSetting);
      return newSetting;
    }
  }
  
  // Aggregation methods
  async getSkillMatrix(): Promise<SkillMatrixData> {
    const members = await this.getTeamMembers();
    const skills = await this.getSkills();
    const currentSnapshot = await this.getCurrentWeeklySnapshot();
    
    if (!currentSnapshot) {
      return { members, skills, assessments: {} };
    }
    
    const assessments = await this.getSkillAssessmentsBySnapshot(currentSnapshot.id);
    
    // Create a map of memberID -> skillID -> level
    const assessmentMap: Record<string, Record<string, number>> = {};
    
    for (const member of members) {
      assessmentMap[member.id.toString()] = {};
      
      for (const skill of skills) {
        const assessment = assessments.find(
          a => a.teamMemberId === member.id && a.skillId === skill.id
        );
        
        assessmentMap[member.id.toString()][skill.id.toString()] = 
          assessment ? assessment.level : SkillLevel.Unknown;
      }
    }
    
    return { members, skills, assessments: assessmentMap };
  }
  
  async getWeeklyComparison(): Promise<WeeklyComparisonData> {
    const skills = await this.getSkills();
    const currentSnapshot = await this.getCurrentWeeklySnapshot();
    const previousSnapshot = await this.getPreviousWeeklySnapshot();
    
    if (!currentSnapshot) {
      return { skills, currentWeek: [], previousWeek: [] };
    }
    
    const currentAssessments = await this.getSkillAssessmentsBySnapshot(currentSnapshot.id);
    const previousAssessments = previousSnapshot 
      ? await this.getSkillAssessmentsBySnapshot(previousSnapshot.id)
      : [];
    
    const members = await this.getTeamMembers();
    const memberCount = members.length;
    
    // Calculate average skill levels
    const currentWeek: number[] = [];
    const previousWeek: number[] = [];
    
    for (const skill of skills) {
      // Current week average
      const currentSkillAssessments = currentAssessments.filter(a => a.skillId === skill.id);
      const currentSum = currentSkillAssessments.reduce((sum, a) => sum + a.level, 0);
      const currentAvg = currentSkillAssessments.length > 0 
        ? parseFloat((currentSum / memberCount).toFixed(1)) 
        : 0;
      
      currentWeek.push(currentAvg);
      
      // Previous week average
      const previousSkillAssessments = previousAssessments.filter(a => a.skillId === skill.id);
      const previousSum = previousSkillAssessments.reduce((sum, a) => sum + a.level, 0);
      const previousAvg = previousSkillAssessments.length > 0 
        ? parseFloat((previousSum / memberCount).toFixed(1)) 
        : 0;
      
      previousWeek.push(previousAvg);
    }
    
    return { skills, currentWeek, previousWeek };
  }
  
  async getGrowthPerSkill(): Promise<GrowthPerSkillData> {
    const skills = await this.getSkills();
    const snapshots = (await this.getWeeklySnapshots()).slice(0, 4); // Last 4 weeks
    
    const data: Record<number, number[]> = {};
    
    for (const skill of skills) {
      data[skill.id] = [];
      
      for (const snapshot of snapshots) {
        const assessments = await this.getSkillAssessmentsBySnapshot(snapshot.id);
        const skillAssessments = assessments.filter(a => a.skillId === skill.id);
        
        if (skillAssessments.length === 0) {
          data[skill.id].push(0);
          continue;
        }
        
        const members = await this.getTeamMembers();
        const sum = skillAssessments.reduce((acc, a) => acc + a.level, 0);
        const avg = parseFloat((sum / members.length).toFixed(1));
        
        data[skill.id].push(avg);
      }
      
      // Reverse the array to show oldest -> newest
      data[skill.id].reverse();
    }
    
    return { skills, snapshots: snapshots.reverse(), data };
  }
  
  async getTeamStats(): Promise<{
    teamSize: number;
    totalSkills: number;
    avgSkillLevel: number;
    growthAreas: number;
    stagnantAreas: number;
  }> {
    const members = await this.getTeamMembers();
    const skills = await this.getSkills();
    const currentSnapshot = await this.getCurrentWeeklySnapshot();
    const previousSnapshot = await this.getPreviousWeeklySnapshot();
    
    let avgSkillLevel = 0;
    let growthAreas = 0;
    let stagnantAreas = 0;
    
    if (currentSnapshot) {
      const currentAssessments = await this.getSkillAssessmentsBySnapshot(currentSnapshot.id);
      
      // Calculate average skill level
      const totalAssessments = currentAssessments.length;
      const totalLevels = currentAssessments.reduce((sum, a) => sum + a.level, 0);
      avgSkillLevel = totalAssessments > 0 
        ? parseFloat((totalLevels / totalAssessments).toFixed(1))
        : 0;
      
      // Calculate growth areas and stagnant areas
      if (previousSnapshot) {
        const previousAssessments = await this.getSkillAssessmentsBySnapshot(previousSnapshot.id);
        
        for (const skill of skills) {
          let hasGrowth = false;
          let hasStagnation = false;
          
          for (const member of members) {
            const currentAssessment = currentAssessments.find(
              a => a.skillId === skill.id && a.teamMemberId === member.id
            );
            
            const previousAssessment = previousAssessments.find(
              a => a.skillId === skill.id && a.teamMemberId === member.id
            );
            
            if (currentAssessment && previousAssessment) {
              if (currentAssessment.level > previousAssessment.level) {
                hasGrowth = true;
              } else if (currentAssessment.level === previousAssessment.level && 
                         currentAssessment.level < SkillLevel.Expert) {
                hasStagnation = true;
              }
            }
          }
          
          if (hasGrowth) growthAreas++;
          if (hasStagnation && !hasGrowth) stagnantAreas++;
        }
      }
    }
    
    return {
      teamSize: members.length,
      totalSkills: skills.length,
      avgSkillLevel,
      growthAreas,
      stagnantAreas
    };
  }
  
  async getTopSkills(): Promise<{
    id: number;
    name: string;
    icon: string;
    iconColor: string;
    averageLevel: number;
    growth: number;
  }[]> {
    const skills = await this.getSkills();
    const currentSnapshot = await this.getCurrentWeeklySnapshot();
    const previousSnapshot = await this.getPreviousWeeklySnapshot();
    
    if (!currentSnapshot) {
      return [];
    }
    
    const currentAssessments = await this.getSkillAssessmentsBySnapshot(currentSnapshot.id);
    const previousAssessments = previousSnapshot 
      ? await this.getSkillAssessmentsBySnapshot(previousSnapshot.id)
      : [];
    
    const members = await this.getTeamMembers();
    const memberCount = members.length;
    
    const topSkills = skills.map(skill => {
      const currentSkillAssessments = currentAssessments.filter(a => a.skillId === skill.id);
      const currentSum = currentSkillAssessments.reduce((sum, a) => sum + a.level, 0);
      const currentAvg = currentSkillAssessments.length > 0 
        ? parseFloat((currentSum / memberCount).toFixed(1)) 
        : 0;
      
      const previousSkillAssessments = previousAssessments.filter(a => a.skillId === skill.id);
      const previousSum = previousSkillAssessments.reduce((sum, a) => sum + a.level, 0);
      const previousAvg = previousSkillAssessments.length > 0 
        ? parseFloat((previousSum / memberCount).toFixed(1)) 
        : 0;
      
      const growth = parseFloat((currentAvg - previousAvg).toFixed(1));
      
      return {
        id: skill.id,
        name: skill.name,
        icon: skill.icon,
        iconColor: skill.iconColor,
        averageLevel: currentAvg,
        growth
      };
    });
    
    // Sort by average level descending
    return topSkills.sort((a, b) => b.averageLevel - a.averageLevel);
  }
  
  // Initialize with demo data
  async initDemoData(): Promise<void> {
    // Create team members
    const john = await this.createTeamMember({
      name: "John Doe",
      role: "Frontend Developer",
      initials: "JD",
      avatarColor: "#3B82F6", // blue-500
    });
    
    const jane = await this.createTeamMember({
      name: "Jane Smith",
      role: "Backend Developer",
      initials: "JS",
      avatarColor: "#8B5CF6", // purple-500
    });
    
    const robert = await this.createTeamMember({
      name: "Robert Johnson",
      role: "Fullstack Developer",
      initials: "RJ",
      avatarColor: "#10B981", // green-500
    });
    
    // Create skills
    const javascript = await this.createSkill({
      name: "JavaScript",
      icon: "code-s-slash-line",
      iconColor: "#3B82F6", // blue-500
    });
    
    const react = await this.createSkill({
      name: "React",
      icon: "reactjs-line",
      iconColor: "#3B82F6", // blue-500
    });
    
    const typescript = await this.createSkill({
      name: "TypeScript",
      icon: "terminal-box-line",
      iconColor: "#3B82F6", // blue-500
    });
    
    const postgres = await this.createSkill({
      name: "PostgreSQL",
      icon: "database-2-line",
      iconColor: "#3B82F6", // blue-500
    });
    
    const git = await this.createSkill({
      name: "Git",
      icon: "git-branch-line",
      iconColor: "#3B82F6", // blue-500
    });
    
    const devops = await this.createSkill({
      name: "DevOps",
      icon: "server-line",
      iconColor: "#EF4444", // red-500
    });
    
    const testing = await this.createSkill({
      name: "Testing",
      icon: "test-tube-line",
      iconColor: "#EF4444", // red-500
    });
    
    // Create weekly snapshots
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const currentWeek = new Date();
    
    const week1 = await this.createWeeklySnapshot({
      weekOf: fourWeeksAgo,
    });
    
    const week2 = await this.createWeeklySnapshot({
      weekOf: threeWeeksAgo,
    });
    
    const week3 = await this.createWeeklySnapshot({
      weekOf: twoWeeksAgo,
    });
    
    const week4 = await this.createWeeklySnapshot({
      weekOf: oneWeekAgo,
    });
    
    const week5 = await this.createWeeklySnapshot({
      weekOf: currentWeek,
    }, true);
    
    // Create assessments for Week 4 (previous week)
    // John's previous week assessments
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: javascript.id,
      snapshotId: week4.id,
      level: SkillLevel.Expert,
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: react.id,
      snapshotId: week4.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: typescript.id,
      snapshotId: week4.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: postgres.id,
      snapshotId: week4.id,
      level: SkillLevel.BasicKnowledge,
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: git.id,
      snapshotId: week4.id,
      level: SkillLevel.Expert,
    });
    
    // Jane's previous week assessments
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: javascript.id,
      snapshotId: week4.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: react.id,
      snapshotId: week4.id,
      level: SkillLevel.BasicKnowledge,
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: typescript.id,
      snapshotId: week4.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: postgres.id,
      snapshotId: week4.id,
      level: SkillLevel.Expert,
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: git.id,
      snapshotId: week4.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    // Robert's previous week assessments
    await this.createSkillAssessment({
      teamMemberId: robert.id,
      skillId: javascript.id,
      snapshotId: week4.id,
      level: SkillLevel.Expert,
    });
    
    await this.createSkillAssessment({
      teamMemberId: robert.id,
      skillId: react.id,
      snapshotId: week4.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: robert.id,
      skillId: typescript.id,
      snapshotId: week4.id,
      level: SkillLevel.BasicKnowledge,
    });
    
    await this.createSkillAssessment({
      teamMemberId: robert.id,
      skillId: postgres.id,
      snapshotId: week4.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: robert.id,
      skillId: git.id,
      snapshotId: week4.id,
      level: SkillLevel.BasicKnowledge,
    });
    
    // Create assessments for Week 5 (current week)
    // John's current week assessments
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: javascript.id,
      snapshotId: week5.id,
      level: SkillLevel.Expert,
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: react.id,
      snapshotId: week5.id,
      level: SkillLevel.Expert,
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: typescript.id,
      snapshotId: week5.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: postgres.id,
      snapshotId: week5.id,
      level: SkillLevel.BasicKnowledge,
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: git.id,
      snapshotId: week5.id,
      level: SkillLevel.Expert,
    });
    
    // Jane's current week assessments
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: javascript.id,
      snapshotId: week5.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: react.id,
      snapshotId: week5.id,
      level: SkillLevel.BasicKnowledge,
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: typescript.id,
      snapshotId: week5.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: postgres.id,
      snapshotId: week5.id,
      level: SkillLevel.Expert,
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: git.id,
      snapshotId: week5.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    // Robert's current week assessments
    await this.createSkillAssessment({
      teamMemberId: robert.id,
      skillId: javascript.id,
      snapshotId: week5.id,
      level: SkillLevel.Expert,
    });
    
    await this.createSkillAssessment({
      teamMemberId: robert.id,
      skillId: react.id,
      snapshotId: week5.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: robert.id,
      skillId: typescript.id,
      snapshotId: week5.id,
      level: SkillLevel.BasicKnowledge,
    });
    
    await this.createSkillAssessment({
      teamMemberId: robert.id,
      skillId: postgres.id,
      snapshotId: week5.id,
      level: SkillLevel.HandsOnExperience,
    });
    
    await this.createSkillAssessment({
      teamMemberId: robert.id,
      skillId: git.id,
      snapshotId: week5.id,
      level: SkillLevel.BasicKnowledge,
    });
    
    // Create previous assessments for growth charts
    // Week 1 assessments (simplified for brevity)
    const skillIds = [javascript.id, react.id, typescript.id];
    const memberIds = [john.id, jane.id, robert.id];
    
    // Week 1 - base levels
    for (const memberId of memberIds) {
      for (const skillId of skillIds) {
        await this.createSkillAssessment({
          teamMemberId: memberId,
          skillId: skillId,
          snapshotId: week1.id,
          level: Math.floor(Math.random() * 2) + 1, // Random level between 1-2
        });
      }
    }
    
    // Week 2 - slight improvement
    for (const memberId of memberIds) {
      for (const skillId of skillIds) {
        const prevAssessment = Array.from(this.skillAssessments.values()).find(
          a => a.teamMemberId === memberId && a.skillId === skillId && a.snapshotId === week1.id
        );
        
        if (prevAssessment) {
          const newLevel = Math.min(prevAssessment.level + (Math.random() > 0.7 ? 1 : 0), 3);
          
          await this.createSkillAssessment({
            teamMemberId: memberId,
            skillId: skillId,
            snapshotId: week2.id,
            level: newLevel,
          });
        }
      }
    }
    
    // Week 3 - more improvement
    for (const memberId of memberIds) {
      for (const skillId of skillIds) {
        const prevAssessment = Array.from(this.skillAssessments.values()).find(
          a => a.teamMemberId === memberId && a.skillId === skillId && a.snapshotId === week2.id
        );
        
        if (prevAssessment) {
          const newLevel = Math.min(prevAssessment.level + (Math.random() > 0.6 ? 1 : 0), 3);
          
          await this.createSkillAssessment({
            teamMemberId: memberId,
            skillId: skillId,
            snapshotId: week3.id,
            level: newLevel,
          });
        }
      }
    }
  }
}

import { db } from "./db";
import { eq, desc, and, isNull, asc, sql } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Team Member methods
  async getTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers);
  }
  
  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member || undefined;
  }
  
  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [member] = await db
      .insert(teamMembers)
      .values(teamMember)
      .returning();
    return member;
  }
  
  async updateTeamMember(id: number, teamMember: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [updated] = await db
      .update(teamMembers)
      .set(teamMember)
      .where(eq(teamMembers.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteTeamMember(id: number): Promise<boolean> {
    const deleted = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, id))
      .returning({ id: teamMembers.id });
    
    return deleted.length > 0;
  }
  
  // Skill methods
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }
  
  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }
  
  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db
      .insert(skills)
      .values(skill)
      .returning();
    return newSkill;
  }
  
  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill | undefined> {
    const [updated] = await db
      .update(skills)
      .set(skill)
      .where(eq(skills.id, id))
      .returning();
    return updated || undefined;
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    const deleted = await db
      .delete(skills)
      .where(eq(skills.id, id))
      .returning({ id: skills.id });
    
    return deleted.length > 0;
  }
  
  // Weekly Snapshot methods
  async getWeeklySnapshots(): Promise<WeeklySnapshot[]> {
    return await db
      .select()
      .from(weeklySnapshots)
      .orderBy(desc(weeklySnapshots.weekOf));
  }
  
  async getCurrentWeeklySnapshot(): Promise<WeeklySnapshot | undefined> {
    const [current] = await db
      .select()
      .from(weeklySnapshots)
      .where(eq(weeklySnapshots.isCurrentWeek, true));
    return current || undefined;
  }
  
  async getPreviousWeeklySnapshot(): Promise<WeeklySnapshot | undefined> {
    const current = await this.getCurrentWeeklySnapshot();
    if (!current) return undefined;
    
    const [previous] = await db
      .select()
      .from(weeklySnapshots)
      .where(sql`${weeklySnapshots.weekOf} < ${current.weekOf}`)
      .orderBy(desc(weeklySnapshots.weekOf))
      .limit(1);
    
    return previous || undefined;
  }
  
  async createWeeklySnapshot(snapshot: InsertWeeklySnapshot, setCurrent = false): Promise<WeeklySnapshot> {
    if (setCurrent) {
      await db
        .update(weeklySnapshots)
        .set({ isCurrentWeek: false })
        .where(eq(weeklySnapshots.isCurrentWeek, true));
    }
    
    const [newSnapshot] = await db
      .insert(weeklySnapshots)
      .values({ ...snapshot, isCurrentWeek: setCurrent })
      .returning();
    
    return newSnapshot;
  }
  
  // Skill Assessment methods
  async getSkillAssessments(): Promise<SkillAssessment[]> {
    return await db.select().from(skillAssessments);
  }
  
  async getSkillAssessmentsBySnapshot(snapshotId: number): Promise<SkillAssessment[]> {
    return await db
      .select()
      .from(skillAssessments)
      .where(eq(skillAssessments.snapshotId, snapshotId));
  }
  
  async getSkillAssessmentsByTeamMember(teamMemberId: number): Promise<SkillAssessment[]> {
    return await db
      .select()
      .from(skillAssessments)
      .where(eq(skillAssessments.teamMemberId, teamMemberId));
  }
  
  async createSkillAssessment(assessment: InsertSkillAssessment): Promise<SkillAssessment> {
    // Check if an assessment already exists for this member, skill, and snapshot
    const [existing] = await db
      .select()
      .from(skillAssessments)
      .where(
        and(
          eq(skillAssessments.teamMemberId, assessment.teamMemberId),
          eq(skillAssessments.skillId, assessment.skillId),
          eq(skillAssessments.snapshotId, assessment.snapshotId)
        )
      );
    
    if (existing) {
      // Update instead of creating new
      const [updated] = await db
        .update(skillAssessments)
        .set({ level: assessment.level })
        .where(eq(skillAssessments.id, existing.id))
        .returning();
      return updated;
    }
    
    const [newAssessment] = await db
      .insert(skillAssessments)
      .values(assessment)
      .returning();
    
    return newAssessment;
  }
  
  async updateSkillAssessment(id: number, assessment: Partial<InsertSkillAssessment>): Promise<SkillAssessment | undefined> {
    const [updated] = await db
      .update(skillAssessments)
      .set(assessment)
      .where(eq(skillAssessments.id, id))
      .returning();
    
    return updated || undefined;
  }
  
  // Settings methods
  async getSetting(key: string): Promise<Settings | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    
    return setting || undefined;
  }
  
  async updateSetting(key: string, value: any): Promise<Settings> {
    const existing = await this.getSetting(key);
    
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value })
        .where(eq(settings.id, existing.id))
        .returning();
      
      return updated;
    } else {
      const [newSetting] = await db
        .insert(settings)
        .values({ key, value })
        .returning();
      
      return newSetting;
    }
  }
  
  // Aggregation methods
  async getSkillMatrix(): Promise<SkillMatrixData> {
    const members = await this.getTeamMembers();
    const skills = await this.getSkills();
    const currentSnapshot = await this.getCurrentWeeklySnapshot();
    
    if (!currentSnapshot) {
      return { members, skills, assessments: {} };
    }
    
    const assessments = await this.getSkillAssessmentsBySnapshot(currentSnapshot.id);
    
    // Create a map of memberID -> skillID -> level
    const assessmentMap: Record<string, Record<string, number>> = {};
    
    for (const member of members) {
      assessmentMap[member.id.toString()] = {};
      
      for (const skill of skills) {
        const assessment = assessments.find(
          a => a.teamMemberId === member.id && a.skillId === skill.id
        );
        
        assessmentMap[member.id.toString()][skill.id.toString()] = 
          assessment ? assessment.level : SkillLevel.Unknown;
      }
    }
    
    return { members, skills, assessments: assessmentMap };
  }
  
  async getWeeklyComparison(): Promise<WeeklyComparisonData> {
    const skills = await this.getSkills();
    const currentSnapshot = await this.getCurrentWeeklySnapshot();
    const previousSnapshot = await this.getPreviousWeeklySnapshot();
    
    if (!currentSnapshot) {
      return { skills, currentWeek: [], previousWeek: [] };
    }
    
    const currentAssessments = await this.getSkillAssessmentsBySnapshot(currentSnapshot.id);
    const previousAssessments = previousSnapshot 
      ? await this.getSkillAssessmentsBySnapshot(previousSnapshot.id)
      : [];
    
    const members = await this.getTeamMembers();
    const memberCount = members.length;
    
    // Calculate average skill levels
    const currentWeek: number[] = [];
    const previousWeek: number[] = [];
    
    for (const skill of skills) {
      // Current week average
      const currentSkillAssessments = currentAssessments.filter(a => a.skillId === skill.id);
      const currentSum = currentSkillAssessments.reduce((sum, a) => sum + a.level, 0);
      const currentAvg = currentSkillAssessments.length > 0 
        ? parseFloat((currentSum / memberCount).toFixed(1)) 
        : 0;
      
      currentWeek.push(currentAvg);
      
      // Previous week average
      const previousSkillAssessments = previousAssessments.filter(a => a.skillId === skill.id);
      const previousSum = previousSkillAssessments.reduce((sum, a) => sum + a.level, 0);
      const previousAvg = previousSkillAssessments.length > 0 
        ? parseFloat((previousSum / memberCount).toFixed(1)) 
        : 0;
      
      previousWeek.push(previousAvg);
    }
    
    return { skills, currentWeek, previousWeek };
  }
  
  async getGrowthPerSkill(): Promise<GrowthPerSkillData> {
    const skills = await this.getSkills();
    const snapshots = (await this.getWeeklySnapshots()).slice(0, 4); // Last 4 weeks
    
    const data: Record<number, number[]> = {};
    
    for (const skill of skills) {
      data[skill.id] = [];
      
      for (const snapshot of snapshots) {
        const assessments = await this.getSkillAssessmentsBySnapshot(snapshot.id);
        const skillAssessments = assessments.filter(a => a.skillId === skill.id);
        
        if (skillAssessments.length === 0) {
          data[skill.id].push(0);
          continue;
        }
        
        const members = await this.getTeamMembers();
        const sum = skillAssessments.reduce((acc, a) => acc + a.level, 0);
        const avg = parseFloat((sum / members.length).toFixed(1));
        
        data[skill.id].push(avg);
      }
      
      // Reverse the array to show oldest -> newest
      data[skill.id].reverse();
    }
    
    return { skills, snapshots: snapshots.reverse(), data };
  }
  
  async getTeamStats(): Promise<{
    teamSize: number;
    totalSkills: number;
    avgSkillLevel: number;
    growthAreas: number;
    stagnantAreas: number;
    teamSizeChange: number;
    skillsChange: number;
    avgSkillLevelChange: number;
  }> {
    const members = await this.getTeamMembers();
    const skills = await this.getSkills();
    const currentSnapshot = await this.getCurrentWeeklySnapshot();
    const previousSnapshot = await this.getPreviousWeeklySnapshot();
    
    let avgSkillLevel = 0;
    let growthAreas = 0;
    let stagnantAreas = 0;
    let previousAvgSkillLevel = 0;
    
    // Calculate changes (mock for initial data)
    const teamSizeChange = Math.round(members.length * 0.2); // Assume 20% growth
    const skillsChange = Math.round(skills.length * 0.15); // Assume 15% growth
    
    if (currentSnapshot) {
      const currentAssessments = await this.getSkillAssessmentsBySnapshot(currentSnapshot.id);
      
      // Calculate average skill level
      const totalAssessments = currentAssessments.length;
      const totalLevels = currentAssessments.reduce((sum, a) => sum + a.level, 0);
      avgSkillLevel = totalAssessments > 0 
        ? parseFloat((totalLevels / totalAssessments).toFixed(1))
        : 0;
      
      // Calculate growth areas and stagnant areas
      if (previousSnapshot) {
        const previousAssessments = await this.getSkillAssessmentsBySnapshot(previousSnapshot.id);
        
        // Calculate previous average skill level
        const previousTotalLevels = previousAssessments.reduce((sum, a) => sum + a.level, 0);
        previousAvgSkillLevel = previousAssessments.length > 0
          ? parseFloat((previousTotalLevels / previousAssessments.length).toFixed(1))
          : 0;
        
        for (const skill of skills) {
          let hasGrowth = false;
          let hasStagnation = false;
          
          for (const member of members) {
            const currentAssessment = currentAssessments.find(
              a => a.skillId === skill.id && a.teamMemberId === member.id
            );
            
            const previousAssessment = previousAssessments.find(
              a => a.skillId === skill.id && a.teamMemberId === member.id
            );
            
            if (currentAssessment && previousAssessment) {
              if (currentAssessment.level > previousAssessment.level) {
                hasGrowth = true;
              } else if (currentAssessment.level === previousAssessment.level && 
                         currentAssessment.level < SkillLevel.Expert) {
                hasStagnation = true;
              }
            }
          }
          
          if (hasGrowth) growthAreas++;
          if (hasStagnation) stagnantAreas++;
        }
      }
    }
    
    // Calculate the change in average skill level
    const avgSkillLevelChange = previousAvgSkillLevel > 0
      ? parseFloat((avgSkillLevel - previousAvgSkillLevel).toFixed(1))
      : parseFloat((avgSkillLevel * 0.1).toFixed(1)); // Fallback if no previous data
    
    return {
      teamSize: members.length,
      totalSkills: skills.length,
      avgSkillLevel,
      growthAreas,
      stagnantAreas,
      teamSizeChange,
      skillsChange,
      avgSkillLevelChange
    };
  }
  
  async getTopSkills(): Promise<{
    id: number;
    name: string;
    icon: string;
    iconColor: string;
    averageLevel: number;
    growth: number;
  }[]> {
    const skills = await this.getSkills();
    const currentSnapshot = await this.getCurrentWeeklySnapshot();
    const previousSnapshot = await this.getPreviousWeeklySnapshot();
    
    if (!currentSnapshot) {
      return [];
    }
    
    const currentAssessments = await this.getSkillAssessmentsBySnapshot(currentSnapshot.id);
    const previousAssessments = previousSnapshot
      ? await this.getSkillAssessmentsBySnapshot(previousSnapshot.id)
      : [];
    
    const members = await this.getTeamMembers();
    const memberCount = members.length;
    
    const result = skills.map(skill => {
      // Current week average
      const currentSkillAssessments = currentAssessments.filter(a => a.skillId === skill.id);
      const currentSum = currentSkillAssessments.reduce((sum, a) => sum + a.level, 0);
      const currentAvg = currentSkillAssessments.length > 0 
        ? parseFloat((currentSum / memberCount).toFixed(1)) 
        : 0;
      
      // Previous week average
      const previousSkillAssessments = previousAssessments.filter(a => a.skillId === skill.id);
      const previousSum = previousSkillAssessments.reduce((sum, a) => sum + a.level, 0);
      const previousAvg = previousSkillAssessments.length > 0 
        ? parseFloat((previousSum / memberCount).toFixed(1)) 
        : 0;
      
      // Calculate growth
      const growth = previousAvg > 0 
        ? parseFloat(((currentAvg - previousAvg) / previousAvg * 100).toFixed(1))
        : 0;
      
      return {
        id: skill.id,
        name: skill.name,
        icon: skill.icon,
        iconColor: skill.iconColor,
        averageLevel: currentAvg,
        growth
      };
    });
    
    // Sort by averageLevel in descending order
    return result.sort((a, b) => b.averageLevel - a.averageLevel);
  }
  
  // Initialize with demo data (for development)
  async initDemoData(): Promise<void> {
    // Add team members
    const john = await this.createTeamMember({
      name: "John Doe",
      role: "Frontend Developer",
      initials: "JD",
      avatarColor: "#4f46e5" // Indigo
    });
    
    const jane = await this.createTeamMember({
      name: "Jane Smith",
      role: "Backend Developer",
      initials: "JS",
      avatarColor: "#06b6d4" // Cyan
    });
    
    const bob = await this.createTeamMember({
      name: "Bob Johnson",
      role: "Product Manager",
      initials: "BJ",
      avatarColor: "#ec4899" // Pink
    });
    
    // Add skills
    const javascript = await this.createSkill({
      name: "JavaScript",
      icon: "code-s-slash-line",
      iconColor: "#f59e0b" // Amber
    });
    
    const typescript = await this.createSkill({
      name: "TypeScript",
      icon: "code-s-slash-line",
      iconColor: "#3b82f6" // Blue
    });
    
    const react = await this.createSkill({
      name: "React",
      icon: "reactjs-line",
      iconColor: "#06b6d4" // Cyan
    });
    
    const node = await this.createSkill({
      name: "Node.js",
      icon: "nodejs-line",
      iconColor: "#10b981" // Emerald
    });
    
    const python = await this.createSkill({
      name: "Python",
      icon: "python-line",
      iconColor: "#6366f1" // Indigo
    });
    
    const sql = await this.createSkill({
      name: "SQL",
      icon: "database-2-line",
      iconColor: "#8b5cf6" // Violet
    });
    
    const communication = await this.createSkill({
      name: "Communication",
      icon: "discuss-line",
      iconColor: "#ec4899" // Pink
    });
    
    // Create weekly snapshots (2 weeks)
    const previousWeek = new Date();
    previousWeek.setDate(previousWeek.getDate() - 7);
    
    const prevSnapshot = await this.createWeeklySnapshot({
      weekOf: previousWeek,
    }, false);
    
    const currentSnapshot = await this.createWeeklySnapshot({
      weekOf: new Date(),
    }, true);
    
    // Add skill assessments for previous week
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: javascript.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.Expert
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: typescript.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.HandsOnExperience
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: react.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.Expert
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: node.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.BasicKnowledge
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: python.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.Unknown
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: sql.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.BasicKnowledge
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: communication.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.HandsOnExperience
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: javascript.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.HandsOnExperience
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: typescript.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.HandsOnExperience
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: react.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.BasicKnowledge
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: node.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.Expert
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: python.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.Expert
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: sql.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.Expert
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: communication.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.HandsOnExperience
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: javascript.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.BasicKnowledge
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: typescript.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.Unknown
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: react.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.BasicKnowledge
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: node.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.Unknown
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: python.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.BasicKnowledge
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: sql.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.BasicKnowledge
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: communication.id,
      snapshotId: prevSnapshot.id,
      level: SkillLevel.Expert
    });
    
    // Add skill assessments for current week (with some improvements)
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: javascript.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.Expert
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: typescript.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.Expert // Improved
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: react.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.Expert
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: node.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.HandsOnExperience // Improved
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: python.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.BasicKnowledge // Improved
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: sql.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.BasicKnowledge
    });
    
    await this.createSkillAssessment({
      teamMemberId: john.id,
      skillId: communication.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.HandsOnExperience
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: javascript.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.HandsOnExperience
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: typescript.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.HandsOnExperience
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: react.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.HandsOnExperience // Improved
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: node.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.Expert
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: python.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.Expert
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: sql.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.Expert
    });
    
    await this.createSkillAssessment({
      teamMemberId: jane.id,
      skillId: communication.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.Expert // Improved
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: javascript.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.HandsOnExperience // Improved
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: typescript.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.BasicKnowledge // Improved
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: react.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.HandsOnExperience // Improved
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: node.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.BasicKnowledge // Improved
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: python.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.BasicKnowledge
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: sql.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.HandsOnExperience // Improved
    });
    
    await this.createSkillAssessment({
      teamMemberId: bob.id,
      skillId: communication.id,
      snapshotId: currentSnapshot.id,
      level: SkillLevel.Expert
    });
  }
}

export const storage = new DatabaseStorage();
