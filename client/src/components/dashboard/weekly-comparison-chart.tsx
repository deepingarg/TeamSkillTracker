import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSkillLevelName } from "@/lib/utils/skill-level";
import { Skill } from "@shared/schema";
import Chart from "chart.js/auto";

interface WeeklyComparisonChartProps {
  skills: Skill[];
  currentWeek: number[];
  previousWeek: number[];
  isLoading?: boolean;
}

export function WeeklyComparisonChart({
  skills,
  currentWeek,
  previousWeek,
  isLoading = false,
}: WeeklyComparisonChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (isLoading || !chartRef.current || skills.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: skills.map(skill => skill.name),
        datasets: [
          {
            label: "Previous Week",
            data: previousWeek,
            backgroundColor: "rgba(156, 163, 175, 0.6)",
            borderColor: "rgba(156, 163, 175, 1)",
            borderWidth: 1,
          },
          {
            label: "Current Week",
            data: currentWeek,
            backgroundColor: "rgba(59, 130, 246, 0.6)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
          },
        ],
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
                let label = "";

                label = getSkillLevelName(Math.floor(value));

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
  }, [skills, currentWeek, previousWeek, isLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly Skill Growth</CardTitle>
        <div className="text-xs text-gray-500">
          Current Week vs Previous Week
        </div>
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
