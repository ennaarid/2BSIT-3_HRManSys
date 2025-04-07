
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  jobcode: z.string().min(1, "Job code is required"),
  jobdesc: z.string().min(1, "Job description is required"),
});

type FormValues = z.infer<typeof formSchema>;

type JobFormProps = {
  job?: {
    jobcode: string;
    jobdesc: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
  isEdit?: boolean;
};

export default function JobForm({ job, onSuccess, onCancel, isEdit = false }: JobFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobcode: job?.jobcode || "",
      jobdesc: job?.jobdesc || "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      if (isEdit) {
        // Update existing job
        const { error } = await supabase
          .from("job")
          .update({
            jobdesc: data.jobdesc
          })
          .eq("jobcode", job?.jobcode);

        if (error) throw error;
        toast.success("Job updated successfully");
      } else {
        // Create new job
        const { error } = await supabase
          .from("job")
          .insert({
            jobcode: data.jobcode,
            jobdesc: data.jobdesc
          });

        if (error) {
          if (error.code === "23505") {
            toast.error("A job with this code already exists");
            setIsLoading(false);
            return;
          }
          throw error;
        }
        toast.success("Job added successfully");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="jobcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Code</FormLabel>
              <FormControl>
                <Input {...field} disabled={isEdit} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jobdesc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEdit ? "Update" : "Add"} Job
          </Button>
        </div>
      </form>
    </Form>
  );
}
