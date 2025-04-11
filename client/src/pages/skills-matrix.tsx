import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SkillsMatrixTable } from "@/components/skills-matrix/skills-matrix-table";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AssessmentForm } from "@/components/assessments/assessment-form";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, Upload } from "lucide-react";
import { useAppContext } from "@/lib/contexts/app-context";
import { format } from "date-fns";
import { SkillMatrixData, Skill, TeamMember } from "@shared/schema";

export default function SkillsMatrix() {
  const { toast } = useToast();
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const { currentSnapshot, isLoadingSnapshots } = useAppContext();
  
  // Fetch skill matrix data
  const { data: skillMatrix, isLoading: isLoadingMatrix } = useQuery<SkillMatrixData>({
    queryKey: ["/api/skill-matrix"],
  });

  const handleImport = () => {
    toast({
      title: "Import Feature",
      description: "Import functionality will be implemented in a future update."
    });
  };

  const handleExport = () => {
    if (!skillMatrix) {
      toast({
        title: "No data",
        description: "There is no data to export.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Convert the skill matrix data to CSV format
      const { members, skills, assessments } = skillMatrix;
      
      // Create header row with skill names
      const headerRow = ['Team Member', 'Role', ...skills.map(skill => skill.name)];
      
      // Create data rows for each team member with their skill levels
      const dataRows = members.map(member => {
        const memberData = [member.name, member.role];
        
        // Add skill levels for each skill
        skills.forEach(skill => {
          const levelKey = `${member.id}_${skill.id}`;
          const level = assessments[levelKey] || 0;
          memberData.push(level.toString());
        });
        
        return memberData;
      });
      
      // Combine all rows into CSV content
      const csvContent = [
        headerRow.join(','),
        ...dataRows.map(row => row.join(','))
      ].join('\n');
      
      // Create a Blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link and trigger the download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `skills-matrix-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: "Skills matrix has been exported as CSV."
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
      title="Skills Matrix" 
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleImport} title="Import data">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport} title="Export data">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Update Skill Level
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Skill Assessment</DialogTitle>
              </DialogHeader>
              <AssessmentForm onSuccess={() => setIsAssessmentDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">Team Skills Matrix</h3>
            {currentSnapshot && (
              <p className="text-sm text-gray-500">
                Current Week: {format(new Date(currentSnapshot.weekOf), "MMM d, yyyy")}
              </p>
            )}
            {!currentSnapshot && !isLoadingSnapshots && (
              <p className="text-sm text-yellow-500">
                No current snapshot available. Create one in Settings.
              </p>
            )}
          </div>
        </div>

        <SkillsMatrixTable
          members={skillMatrix?.members || []}
          skills={skillMatrix?.skills || []}
          assessments={skillMatrix?.assessments || {}}
          isLoading={isLoadingMatrix || isLoadingSnapshots}
        />
      </Card>
    </MainLayout>
  );
}
