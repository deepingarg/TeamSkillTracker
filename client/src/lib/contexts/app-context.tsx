import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  WeeklySnapshot, 
  TeamMember, 
  Skill, 
  SkillAssessment
} from "@shared/schema";

interface AppContextType {
  currentSnapshot?: WeeklySnapshot;
  previousSnapshot?: WeeklySnapshot;
  isLoadingSnapshots: boolean;
  createSnapshot: (date: Date) => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  isLoadingSnapshots: false,
  createSnapshot: async () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  // Get current and previous snapshots
  const { 
    data: currentSnapshot,
    isLoading: isLoadingCurrent,
    refetch: refetchCurrent
  } = useQuery<WeeklySnapshot>({
    queryKey: ["/api/snapshots/current"],
  });

  const { 
    data: previousSnapshot,
    isLoading: isLoadingPrevious,
    refetch: refetchPrevious
  } = useQuery<WeeklySnapshot>({
    queryKey: ["/api/snapshots/previous"],
  });

  const isLoadingSnapshots = isLoadingCurrent || isLoadingPrevious || isCreatingSnapshot;

  // Function to create a new snapshot
  const createSnapshot = async (date: Date) => {
    try {
      setIsCreatingSnapshot(true);
      await fetch(`/api/snapshots?setCurrent=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekOf: date,
        }),
      });
      
      // Refetch snapshots after creating a new one
      await refetchCurrent();
      await refetchPrevious();
      setIsCreatingSnapshot(false);
    } catch (error) {
      console.error("Failed to create snapshot:", error);
      setIsCreatingSnapshot(false);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentSnapshot,
        previousSnapshot,
        isLoadingSnapshots,
        createSnapshot,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
