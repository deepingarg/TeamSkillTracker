import { TeamMember, Skill, SkillLevel } from "@shared/schema";
import { BadgeSkillLevel } from "@/components/ui/badge-skill-level";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SkillsMatrixTableProps {
  members: TeamMember[];
  skills: Skill[];
  assessments: Record<string, Record<string, number>>;
  isLoading?: boolean;
}

export function SkillsMatrixTable({
  members,
  skills,
  assessments,
  isLoading = false,
}: SkillsMatrixTableProps) {
  // Function to get avatar initials from a member
  const getMemberInitials = (member: TeamMember) => {
    return member.initials || member.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Team Member</TableHead>
              {skills.map((skill) => (
                <TableHead key={skill.id}>
                  {skill.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div 
                      className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {getMemberInitials(member)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                  </div>
                </TableCell>
                
                {skills.map((skill) => {
                  const level = assessments[member.id.toString()]?.[skill.id.toString()] || SkillLevel.Unknown;
                  
                  return (
                    <TableCell key={skill.id}>
                      <BadgeSkillLevel level={level} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={skills.length + 1} className="h-24 text-center">
                  No team members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
