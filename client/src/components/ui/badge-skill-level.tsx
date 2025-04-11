import { SkillLevel } from '@shared/schema';
import { getSkillLevelBadgeColor, getSkillLevelName } from '@/lib/utils/skill-level';
import { cn } from '@/lib/utils';

interface BadgeSkillLevelProps {
  level: number;
  className?: string;
  showText?: boolean;
}

export function BadgeSkillLevel({ level, className, showText = true }: BadgeSkillLevelProps) {
  const { bgColor, textColor } = getSkillLevelBadgeColor(level);
  
  return (
    <span className={cn(
      'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
      bgColor,
      textColor,
      className
    )}>
      {showText ? getSkillLevelName(level) : level.toString()}
    </span>
  );
}

export function BadgeGrowth({ growth }: { growth: number }) {
  const isPositive = growth > 0;
  const isNegative = growth < 0;
  const isNeutral = growth === 0;
  
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
  if (isPositive) {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
  } else if (isNegative) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
  }
  
  const formattedGrowth = isPositive ? `+${growth}` : growth.toString();
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {formattedGrowth}
    </span>
  );
}
