import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skill, WeeklySnapshot } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSkillLevelName } from "@/lib/utils/skill-level";
import Chart from "chart.js/auto";

interface GrowthPerSkillChartProps {
  skills: Skill[];
  snapshots: WeeklySnapshot[];
  data: Record<number, number[]>;
  isLoading?: boolean;
}

export function GrowthPerSkillChart({
  skills,
  snapshots,
  data,
  isLoading = false,
}: GrowthPerSkillChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeRange, setTimeRange] = useState("4weeks");

  // Get formatted dates for labels
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const labels = snapshots.map(snapshot => formatDate(new Date(snapshot.weekOf)));

  // Limit displayed skills to 3 to avoid cluttering
  const displayedSkills = skills.slice(0, 3);

  useEffect(() => {
    if (isLoading || !chartRef.current || snapshots.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const datasets = displayedSkills.map((skill, index) => {
      const colors = [
        { border: 'rgba(59, 130, 246, 1)', background: 'rgba(59, 130, 246, 0.1)' }, // blue
        { border: 'rgba(139, 92, 246, 1)', background: 'rgba(139, 92, 246, 0.1)' }, // purple
        { border: 'rgba(16, 185, 129, 1)', background: 'rgba(16, 185, 129, 0.1)' }  // green
      ];

      return {
        label: skill.name,
        data: data[skill.id] || [],
        borderColor: colors[index % colors.length].border,
        backgroundColor: colors[index % colors.length].background,
        tension: 0.3,
        fill: true
      };
    });

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 3,
            title: {
              display: true,
              text: "Skill Level (0-3)",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw as number;
                const label = getSkillLevelName(Math.floor(value));
                return `${context.dataset.label}: ${value} (${label})`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [skills, snapshots, data, isLoading]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Growth Per Skill</CardTitle>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[180px] h-8 text-sm">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4weeks">Last 4 Weeks</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
