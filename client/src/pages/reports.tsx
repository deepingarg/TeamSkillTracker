import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { WeeklyComparisonChart } from "@/components/dashboard/weekly-comparison-chart";
import { GrowthPerSkillChart } from "@/components/dashboard/growth-per-skill-chart";
import { useQuery } from "@tanstack/react-query";
import { 
  WeeklyComparisonData, 
  GrowthPerSkillData, 
  TeamMember, 
  Skill,
  SkillLevel 
} from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BadgeSkillLevel } from "@/components/ui/badge-skill-level";
import { getSkillLevelName } from "@/lib/utils/skill-level";

export default function Reports() {
  const [selectedTab, setSelectedTab] = useState("team");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");

  // Fetch data for reports
  const { data: weeklyComparison, isLoading: isLoadingComparison } = useQuery<WeeklyComparisonData>({
    queryKey: ["/api/weekly-comparison"],
  });

  const { data: growthPerSkill, isLoading: isLoadingGrowth } = useQuery<GrowthPerSkillData>({
    queryKey: ["/api/growth-per-skill"],
  });

  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const { data: skills } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const { data: assessments } = useQuery({
    queryKey: ["/api/assessments"],
  });

  // Create member skill levels chart (simplistic version)
  const getMemberSkillLevels = (memberId: number) => {
    if (!assessments || !skills) return [];
    
    // Get the current snapshot assessments for this member
    const memberAssessments = assessments.filter(
      (a: any) => a.teamMemberId === memberId
    );
    
    return skills.map(skill => {
      const assessment = memberAssessments.find(
        (a: any) => a.skillId === skill.id
      );
      return {
        name: skill.name,
        level: assessment ? assessment.level : SkillLevel.Unknown
      };
    });
  };

  return (
    <MainLayout title="Reports">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="team">Team Reports</TabsTrigger>
          <TabsTrigger value="member">Individual Reports</TabsTrigger>
          <TabsTrigger value="skill">Skill Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WeeklyComparisonChart 
              skills={weeklyComparison?.skills || []}
              currentWeek={weeklyComparison?.currentWeek || []}
              previousWeek={weeklyComparison?.previousWeek || []}
              isLoading={isLoadingComparison}
            />
            <GrowthPerSkillChart 
              skills={growthPerSkill?.skills || []}
              snapshots={growthPerSkill?.snapshots || []}
              data={growthPerSkill?.data || {}}
              isLoading={isLoadingGrowth}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="member" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Member Skills</CardTitle>
              <Select
                value={selectedMember}
                onValueChange={setSelectedMember}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers?.map(member => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {selectedMember ? (
                <div className="space-y-4">
                  {getMemberSkillLevels(parseInt(selectedMember)).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      <BadgeSkillLevel level={item.level} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a team member to view their skills.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="skill" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Distribution</CardTitle>
              <Select
                value={selectedSkill}
                onValueChange={setSelectedSkill}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {skills?.map(skill => (
                    <SelectItem key={skill.id} value={skill.id.toString()}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {selectedSkill ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map(level => {
                      // Count members with this level for the selected skill
                      const membersWithLevel = assessments
                        ? assessments.filter(
                            (a: any) => 
                              a.skillId === parseInt(selectedSkill) && 
                              a.level === level
                          ).length
                        : 0;
                      
                      return (
                        <Card key={level} className="p-4">
                          <div className="flex flex-col items-center">
                            <h3 className="font-medium text-lg">{getSkillLevelName(level)}</h3>
                            <p className="text-3xl font-bold mt-2">{membersWithLevel}</p>
                            <p className="text-sm text-gray-500 mt-1">team members</p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a skill to view its distribution across the team.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
