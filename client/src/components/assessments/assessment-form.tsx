import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TeamMember, Skill, SkillLevel } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getSkillLevelName } from "@/lib/utils/skill-level";

const formSchema = z.object({
  teamMemberId: z.string().min(1, {
    message: "Please select a team member.",
  }),
  skillId: z.string().min(1, {
    message: "Please select a skill.",
  }),
  level: z.string().min(1, {
    message: "Please select a skill level.",
  }),
});

interface AssessmentFormProps {
  onSuccess?: () => void;
}

export function AssessmentForm({ onSuccess }: AssessmentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch necessary data
  const { data: teamMembers, isLoading: isLoadingMembers } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const { data: skills, isLoading: isLoadingSkills } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });

  const { data: currentSnapshot, isLoading: isLoadingSnapshot } = useQuery({
    queryKey: ["/api/snapshots/current"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamMemberId: "",
      skillId: "",
      level: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!currentSnapshot) throw new Error("No current snapshot found");
      
      const data = {
        teamMemberId: parseInt(values.teamMemberId),
        skillId: parseInt(values.skillId),
        snapshotId: currentSnapshot.id,
        level: parseInt(values.level),
      };
      
      const response = await apiRequest(
        "POST",
        "/api/assessments",
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skill-matrix"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-comparison"] });
      queryClient.invalidateQueries({ queryKey: ["/api/team-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/top-skills"] });
      toast({
        title: "Success",
        description: "Skill assessment updated successfully",
      });
      form.reset();
      if (onSuccess) onSuccess();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update assessment: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    createMutation.mutate(values);
  }

  // Loading state
  const isLoading = isLoadingMembers || isLoadingSkills || isLoadingSnapshot;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!currentSnapshot && !isLoadingSnapshot && (
          <div className="rounded-md bg-yellow-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="ri-alarm-warning-line text-yellow-400"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    No current weekly snapshot found. Please create a new snapshot for this week first.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="teamMemberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Member</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading || !currentSnapshot}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skillId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading || !currentSnapshot}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {skills?.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id.toString()}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Level</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading || !currentSnapshot}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={SkillLevel.Unknown.toString()}>
                    {getSkillLevelName(SkillLevel.Unknown)} (0)
                  </SelectItem>
                  <SelectItem value={SkillLevel.BasicKnowledge.toString()}>
                    {getSkillLevelName(SkillLevel.BasicKnowledge)} (1)
                  </SelectItem>
                  <SelectItem value={SkillLevel.HandsOnExperience.toString()}>
                    {getSkillLevelName(SkillLevel.HandsOnExperience)} (2)
                  </SelectItem>
                  <SelectItem value={SkillLevel.Expert.toString()}>
                    {getSkillLevelName(SkillLevel.Expert)} (3)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The current proficiency level for this skill.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting || isLoading || !currentSnapshot}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Skill Assessment
        </Button>
      </form>
    </Form>
  );
}
