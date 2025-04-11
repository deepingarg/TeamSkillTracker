import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { WeeklyComparisonChart } from "@/components/dashboard/weekly-comparison-chart";
import { GrowthPerSkillChart } from "@/components/dashboard/growth-per-skill-chart";
import { Button } from "@/components/ui/button";
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
import { ArrowDownIcon, CalendarIcon, FilePieChartIcon, BarChart3Icon, DownloadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [selectedTab, setSelectedTab] = useState("team");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [isLoadingWeeklyReport, setIsLoadingWeeklyReport] = useState(false);
  const [isLoadingMonthlyReport, setIsLoadingMonthlyReport] = useState(false);
  const { toast } = useToast();

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

  const { data: assessments = [] } = useQuery<any[]>({
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
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Weekly Report
            </CardTitle>
            <CardDescription>
              Generate a detailed report of team performance for the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              This report includes weekly skill comparisons, growth metrics, and areas that need attention. It highlights progress made during the current week compared to the previous week.
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 mb-4">
              <li>Team statistics and skill levels</li>
              <li>Top performing skills</li>
              <li>Growth and stagnant areas</li>
              <li>Week-over-week comparisons</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={async () => {
                try {
                  setIsLoadingWeeklyReport(true);
                  const response = await fetch('/api/reports/weekly');
                  
                  if (!response.ok) {
                    throw new Error('Failed to generate weekly report');
                  }
                  
                  console.log("Weekly report response:", response);
                  const responseText = await response.text();
                  console.log("Weekly response text:", responseText);
                  const report = responseText ? JSON.parse(responseText) : {};
                  
                  // Create a Blob with the JSON data
                  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                  
                  // Create a download link and trigger the download
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  const date = new Date().toISOString().split('T')[0];
                  link.setAttribute('href', url);
                  link.setAttribute('download', `weekly-skills-report-${date}.json`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  toast({
                    title: "Weekly Report Generated",
                    description: "Your weekly report has been downloaded successfully.",
                  });
                } catch (error) {
                  console.error("Error generating report:", error);
                  toast({
                    title: "Report Generation Failed",
                    description: "There was a problem generating the weekly report.",
                    variant: "destructive"
                  });
                } finally {
                  setIsLoadingWeeklyReport(false);
                }
              }}
              disabled={isLoadingWeeklyReport}
            >
              {isLoadingWeeklyReport ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Generate Weekly Report
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3Icon className="h-5 w-5 mr-2" />
              Monthly Report
            </CardTitle>
            <CardDescription>
              Generate a comprehensive monthly report with trends and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              This report provides a comprehensive analysis of team skill development over the past month, including trends, key improvements, and strategic recommendations.
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 mb-4">
              <li>Month-over-month skill comparisons</li>
              <li>Most improved team members</li>
              <li>Skills with highest growth potential</li>
              <li>Strategic recommendations</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={async () => {
                try {
                  setIsLoadingMonthlyReport(true);
                  const response = await fetch('/api/reports/monthly');
                  
                  if (!response.ok) {
                    throw new Error('Failed to generate monthly report');
                  }
                  
                  console.log("Monthly report response:", response);
                  const responseText = await response.text();
                  console.log("Monthly response text:", responseText);
                  const report = responseText ? JSON.parse(responseText) : {};
                  
                  // Create a Blob with the JSON data
                  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                  
                  // Create a download link and trigger the download
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  const date = new Date().toISOString().split('T')[0];
                  link.setAttribute('href', url);
                  link.setAttribute('download', `monthly-skills-report-${date}.json`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  toast({
                    title: "Monthly Report Generated",
                    description: "Your monthly report has been downloaded successfully.",
                  });
                } catch (error) {
                  console.error("Error generating report:", error);
                  toast({
                    title: "Report Generation Failed",
                    description: "There was a problem generating the monthly report.",
                    variant: "destructive"
                  });
                } finally {
                  setIsLoadingMonthlyReport(false);
                }
              }}
              disabled={isLoadingMonthlyReport}
            >
              {isLoadingMonthlyReport ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Generate Monthly Report
                </div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
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
