import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, Loader2 } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  change?: number;
  changeText?: string;
  changeIsPositive?: boolean;
  changeIsNegative?: boolean;
  isLoading?: boolean;
}

export function SummaryCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  change,
  changeText,
  changeIsPositive,
  changeIsNegative,
  isLoading = false,
}: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-full", iconBgColor)}>
          <i className={cn(icon, "text-xl", iconColor)}></i>
        </div>
      </div>
      
      {(change !== undefined || changeText) && (
        <div className="flex items-center mt-4 text-xs">
          <span className={cn(
            "flex items-center",
            changeIsPositive && "text-green-500",
            changeIsNegative && "text-red-500"
          )}>
            {changeIsPositive && <ArrowUpIcon className="h-3 w-3 mr-1" />}
            {changeIsNegative && <ArrowDownIcon className="h-3 w-3 mr-1" />}
            
            {change !== undefined && (
              <span>
                {changeIsPositive ? '+' : ''}{change}{' '}
              </span>
            )}
            
            {changeText}
          </span>
        </div>
      )}
    </div>
  );
}
