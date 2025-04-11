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
import { Skill } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

// Define available icons and colors
const availableIcons = [
  { value: "code-s-slash-line", label: "Code" },
  { value: "reactjs-line", label: "React" },
  { value: "terminal-box-line", label: "Terminal" },
  { value: "database-2-line", label: "Database" },
  { value: "git-branch-line", label: "Git" },
  { value: "server-line", label: "Server" },
  { value: "test-tube-line", label: "Testing" },
  { value: "customer-service-line", label: "Customer Service" },
  { value: "cloud-line", label: "Cloud" },
  { value: "layout-line", label: "UI/UX" },
  { value: "global-line", label: "Web" },
  { value: "stack-line", label: "Stack" },
  { value: "terminal-line", label: "Terminal" },
  { value: "bug-line", label: "Bug" },
  { value: "shield-check-line", label: "Security" },
  { value: "app-store-line", label: "Mobile" },
  { value: "file-code-line", label: "File Code" },
  { value: "pencil-ruler-2-line", label: "Design" },
];

const availableColors = [
  { value: "text-blue-500", label: "Blue", bg: "bg-blue-100" },
  { value: "text-purple-500", label: "Purple", bg: "bg-purple-100" },
  { value: "text-green-500", label: "Green", bg: "bg-green-100" },
  { value: "text-amber-500", label: "Amber", bg: "bg-amber-100" },
  { value: "text-red-500", label: "Red", bg: "bg-red-100" },
  { value: "text-indigo-500", label: "Indigo", bg: "bg-indigo-100" },
  { value: "text-pink-500", label: "Pink", bg: "bg-pink-100" },
  { value: "text-teal-500", label: "Teal", bg: "bg-teal-100" },
];

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  icon: z.string().min(1, {
    message: "Please select an icon.",
  }),
  iconColor: z.string().min(1, {
    message: "Please select a color.",
  }),
});

interface SkillFormProps {
  skill?: Skill;
  onSuccess?: () => void;
}

export function SkillForm({ skill, onSuccess }: SkillFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(skill?.icon || availableIcons[0].value);
  const [selectedColor, setSelectedColor] = useState(skill?.iconColor || availableColors[0].value);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: skill?.name || "",
      icon: skill?.icon || availableIcons[0].value,
      iconColor: skill?.iconColor || availableColors[0].value,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest(
        "POST",
        "/api/skills",
        values
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skill-matrix"] });
      toast({
        title: "Success",
        description: "Skill created successfully",
      });
      form.reset();
      if (onSuccess) onSuccess();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create skill: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!skill) throw new Error("No skill to update");
      
      const response = await apiRequest(
        "PATCH",
        `/api/skills/${skill.id}`,
        values
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skill-matrix"] });
      toast({
        title: "Success",
        description: "Skill updated successfully",
      });
      if (onSuccess) onSuccess();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update skill: ${error.message}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (skill) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  // Get the background color for the selected color
  const getSelectedColorBg = () => {
    const color = availableColors.find(c => c.value === selectedColor);
    return color?.bg || "bg-blue-100";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Name</FormLabel>
              <FormControl>
                <Input placeholder="JavaScript" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedIcon(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableIcons.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center">
                          <i className={`ri-${icon.value} mr-2`}></i>
                          <span>{icon.label}</span>
                        </div>
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
            name="iconColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon Color</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedColor(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full ${color.bg} ${color.value} mr-2`}></div>
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-2">
          <p className="text-sm text-gray-500 mb-2">Preview:</p>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${getSelectedColorBg()} flex items-center justify-center`}>
              <i className={`ri-${selectedIcon} ${selectedColor}`}></i>
            </div>
            <span>{form.getValues("name") || "Skill Name"}</span>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {skill ? "Update" : "Create"} Skill
        </Button>
      </form>
    </Form>
  );
}
