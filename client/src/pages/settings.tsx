import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/lib/contexts/app-context";
import { AlertCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { toast } = useToast();
  const { currentSnapshot, previousSnapshot, isLoadingSnapshots, createSnapshot } = useAppContext();
  const [date, setDate] = useState<Date>(new Date());
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  // Handle create snapshot
  const handleCreateSnapshot = async () => {
    try {
      setIsCreatingSnapshot(true);
      await createSnapshot(date);
      toast({
        title: "Success",
        description: "New weekly snapshot created successfully",
      });
      setIsCreatingSnapshot(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to create snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      setIsCreatingSnapshot(false);
    }
  };

  // Handle confirm create
  const handleConfirmCreate = () => {
    setIsConfirmDialogOpen(false);
    handleCreateSnapshot();
  };

  return (
    <MainLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Weekly Snapshots</CardTitle>
            <CardDescription>
              Create a new weekly snapshot to track skill progress over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Current Status:</h3>
                {isLoadingSnapshots ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading snapshot information...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-3">
                        <p className="text-sm text-gray-500 mb-1">Current Week:</p>
                        <p className="font-medium">
                          {currentSnapshot 
                            ? format(new Date(currentSnapshot.weekOf), "MMMM d, yyyy") 
                            : "No current snapshot"}
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <p className="text-sm text-gray-500 mb-1">Previous Week:</p>
                        <p className="font-medium">
                          {previousSnapshot 
                            ? format(new Date(previousSnapshot.weekOf), "MMMM d, yyyy") 
                            : "No previous snapshot"}
                        </p>
                      </div>
                    </div>
                    
                    {!currentSnapshot && (
                      <Alert variant="warning" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Current Snapshot</AlertTitle>
                        <AlertDescription>
                          There is currently no active weekly snapshot. Create one to start tracking skill assessments.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-4">Create New Snapshot:</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal w-full md:w-[280px]"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(date) => date && setDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Button
                    onClick={() => setIsConfirmDialogOpen(true)}
                    disabled={isCreatingSnapshot || isLoadingSnapshots}
                  >
                    {isCreatingSnapshot && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create New Weekly Snapshot
                  </Button>
                </div>
                
                <p className="mt-2 text-sm text-gray-500">
                  Creating a new snapshot will set it as the current week and move the existing current snapshot to previous.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
            <CardDescription>
              About the Team Skills Management Application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Created by:</strong> Skills Tracker Team</p>
              <p className="text-sm text-gray-500 mt-4">
                This application helps track and visualize team skill growth over time.
                Team members' skills are tracked on a scale from 0 (Unknown) to 3 (Expert),
                allowing managers to identify growth areas and training needs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Weekly Snapshot</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new snapshot for the week of {format(date, "MMMM d, yyyy")}.
              {currentSnapshot && " The current snapshot will be moved to previous."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCreate}>
              Create Snapshot
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
