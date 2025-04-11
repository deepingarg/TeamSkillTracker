import { MainLayout } from "@/components/layout/main-layout";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { WeeklyComparisonChart } from "@/components/dashboard/weekly-comparison-chart";
import { GrowthPerSkillChart } from "@/components/dashboard/growth-per-skill-chart";
import { SkillsList } from "@/components/dashboard/skills-list";
import { SkillsMatrixTable } from "@/components/skills-matrix/skills-matrix-table";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skill, TeamMember, WeeklyComparisonData, GrowthPerSkillData, WeeklySnapshot } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

  // Fetch data for dashboard
  const { data: teamStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/team-stats"],
  });

  const { data: weeklyComparison, isLoading: isLoadingComparison } = useQuery<WeeklyComparisonData>({
    queryKey: ["/api/weekly-comparison"],
  });

  const { data: growthPerSkill, isLoading: isLoadingGrowth } = useQuery<GrowthPerSkillData>({
    queryKey: ["/api/growth-per-skill"],
  });

  const { data: topSkills, isLoading: isLoadingTopSkills } = useQuery({
    queryKey: ["/api/top-skills"],
  });

  const { data: skillMatrix, isLoading: isLoadingMatrix } = useQuery({
    queryKey: ["/api/skill-matrix"],
  });

  // Calculate growth areas and stagnant areas
  const growthAreas = topSkills
    ?.filter(skill => skill.growth > 0)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 5) || [];

  const stagnantAreas = topSkills
    ?.filter(skill => skill.growth === 0)
    .slice(0, 5) || [];

  // Loading state
  const isLoading = 
    isLoadingStats || 
    isLoadingComparison || 
    isLoadingGrowth || 
    isLoadingTopSkills || 
    isLoadingMatrix;

  // Export data action
  const handleExport = () => {
    if (!teamStats || !weeklyComparison || !growthPerSkill || !topSkills) {
      toast({
        title: "No data",
        description: "There is no data to export.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a comprehensive report object
      const reportData = {
        generatedAt: new Date().toISOString(),
        teamStats,
        weeklyComparison,
        growthAreas,
        stagnantAreas
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(reportData, null, 2);
      
      // Create a Blob with the JSON data
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create a download link and trigger the download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `skills-dashboard-report-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Dashboard report has been exported as JSON."
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the data.",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout 
      title="Dashboard" 
      actions={
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <i className="ri-search-line text-gray-400"></i>
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button
            onClick={handleExport}
            className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
          >
            <i className="ri-upload-2-line mr-2"></i>
            <span>Export</span>
          </Button>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Team Size"
          value={teamStats?.teamSize || 0}
          icon="ri-team-line"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-500"
          change={2}
          changeText="from last month"
          changeIsPositive
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total Skills"
          value={teamStats?.totalSkills || 0}
          icon="ri-bookmark-line"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-500"
          change={3}
          changeText="new skills added"
          changeIsPositive
          isLoading={isLoading}
        />
        <SummaryCard
          title="Average Skill Level"
          value={teamStats?.avgSkillLevel || 0}
          icon="ri-bar-chart-line"
          iconBgColor="bg-green-100"
          iconColor="text-green-500"
          change={0.3}
          changeText="from last week"
          changeIsPositive
          isLoading={isLoading}
        />
        <SummaryCard
          title="Growth Areas"
          value={teamStats?.growthAreas || 0}
          icon="ri-rocket-line"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-500"
          change={teamStats?.stagnantAreas || 0}
          changeText="areas with no progress"
          changeIsNegative
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

      {/* Top Skills and Growth Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <SkillsList
          title="Top Team Skills"
          skills={topSkills || []}
          isLoading={isLoadingTopSkills}
        />
        <SkillsList
          title="Highest Growth Areas"
          skills={growthAreas}
          isLoading={isLoadingTopSkills}
          iconBgColor="bg-green-100"
        />
        <SkillsList
          title="Areas with No Progress"
          skills={stagnantAreas}
          isLoading={isLoadingTopSkills}
          iconBgColor="bg-red-100"
          growthIsBad
          emptyMessage="No stagnant areas detected!"
        />
      </div>

      {/* Skills Matrix Preview */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Skills Matrix Preview</h3>
          <Link href="/skills-matrix" className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1">
            <span>View full matrix</span>
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>

        <SkillsMatrixTable
          members={skillMatrix?.members.slice(0, 3) || []}
          skills={skillMatrix?.skills.slice(0, 5) || []}
          assessments={skillMatrix?.assessments || {}}
          isLoading={isLoadingMatrix}
        />
      </div>
    </MainLayout>
  );
}
