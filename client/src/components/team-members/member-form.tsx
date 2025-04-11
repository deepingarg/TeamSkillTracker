import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TeamMember } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

// Generate random color for avatar
const getRandomColor = () => {
  const colors = [
    "#3B82F6", // blue-500
    "#8B5CF6", // purple-500
    "#10B981", // green-500
    "#F59E0B", // amber-500
    "#EF4444", // red-500
    "#EC4899", // pink-500
    "#6366F1", // indigo-500
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate initials from name
const generateInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  role: z.string().min(2, {
    message: "Role must be at least 2 characters.",
  }),
  initials: z.string().optional(),
  avatarColor: z.string().optional(),
});

interface MemberFormProps {
  member?: TeamMember;
  onSuccess?: () => void;
}

export function MemberForm({ member, onSuccess }: MemberFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member?.name || "",
      role: member?.role || "",
      initials: member?.initials || "",
      avatarColor: member?.avatarColor || getRandomColor(),
    },
  });

  // Generate initials when name changes
  const watchName = form.watch("name");
  if (watchName && !form.getValues("initials")) {
    form.setValue("initials", generateInitials(watchName));
  }

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const data = {
        ...values,
        initials: values.initials || generateInitials(values.name),
        avatarColor: values.avatarColor || getRandomColor(),
      };
      
      const response = await apiRequest(
        "POST",
        "/api/team-members",
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skill-matrix"] });
      toast({
        title: "Success",
        description: "Team member created successfully",
      });
      form.reset();
      if (onSuccess) onSuccess();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create team member: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!member) throw new Error("No member to update");
      
      const data = {
        ...values,
        initials: values.initials || generateInitials(values.name),
        avatarColor: values.avatarColor || getRandomColor(),
      };
      
      const response = await apiRequest(
        "PATCH",
        `/api/team-members/${member.id}`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skill-matrix"] });
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
      if (onSuccess) onSuccess();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update team member: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (member) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="Frontend Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {member ? "Update" : "Create"} Team Member
        </Button>
      </form>
    </Form>
  );
}
