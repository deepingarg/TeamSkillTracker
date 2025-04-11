import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatGrowth, getGrowthBadgeColor } from "@/lib/utils/skill-level";

interface SkillsListProps {
  title: string;
  skills: Array<{
    id: number;
    name: string;
    icon: string;
    iconColor: string;
    value?: number;
    growth?: number;
  }>;
  emptyMessage?: string;
  showGrowth?: boolean;
  iconBgColor?: string;
  growthIsBad?: boolean;
  isLoading?: boolean;
}

export function SkillsList({
  title,
  skills,
  emptyMessage = "No skills found",
  showGrowth = true,
  iconBgColor = "bg-blue-100",
  growthIsBad = false,
  isLoading = false,
}: SkillsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-14"></div>
              </div>
            ))}
          </div>
        ) : skills.length > 0 ? (
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", iconBgColor)}>
                    <i className={cn(skill.icon, skill.iconColor)}></i>
                  </div>
                  <span className="font-medium">{skill.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {skill.value !== undefined && (
                    <span className="text-sm font-semibold">{skill.value}</span>
                  )}
                  {showGrowth && skill.growth !== undefined && (
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      growthIsBad 
                        ? (skill.growth === 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800")
                        : getGrowthBadgeColor(skill.growth).bgColor,
                      growthIsBad 
                        ? (skill.growth === 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800")
                        : getGrowthBadgeColor(skill.growth).textColor
                    )}>
                      {growthIsBad && skill.growth === 0 ? '0.0' : formatGrowth(skill.growth)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="ri-emotion-happy-line text-2xl mb-2"></i>
            <p>{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
