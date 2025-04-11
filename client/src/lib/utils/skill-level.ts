import { SkillLevel } from '@shared/schema';

export const getSkillLevelName = (level: number): string => {
  switch (level) {
    case SkillLevel.Unknown:
      return 'Unknown';
    case SkillLevel.BasicKnowledge:
      return 'Basic Knowledge';
    case SkillLevel.HandsOnExperience:
      return 'Hands-on Experience';
    case SkillLevel.Expert:
      return 'Expert';
    default:
      return 'Unknown';
  }
};

export const getSkillLevelBadgeColor = (level: number): { bgColor: string, textColor: string } => {
  switch (level) {
    case SkillLevel.Unknown:
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    case SkillLevel.BasicKnowledge:
      return { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
    case SkillLevel.HandsOnExperience:
      return { bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
    case SkillLevel.Expert:
      return { bgColor: 'bg-green-100', textColor: 'text-green-800' };
    default:
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
  }
};

export const getSkillLevelOptions = () => [
  { value: SkillLevel.Unknown, label: getSkillLevelName(SkillLevel.Unknown) },
  { value: SkillLevel.BasicKnowledge, label: getSkillLevelName(SkillLevel.BasicKnowledge) },
  { value: SkillLevel.HandsOnExperience, label: getSkillLevelName(SkillLevel.HandsOnExperience) },
  { value: SkillLevel.Expert, label: getSkillLevelName(SkillLevel.Expert) },
];

export const getGrowthBadgeColor = (growth: number): { bgColor: string, textColor: string } => {
  if (growth > 0) {
    return { bgColor: 'bg-green-100', textColor: 'text-green-800' };
  } else if (growth < 0) {
    return { bgColor: 'bg-red-100', textColor: 'text-red-800' };
  } else {
    return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
  }
};

export const formatGrowth = (growth: number): string => {
  if (growth > 0) {
    return `+${growth}`;
  }
  return `${growth}`;
};
