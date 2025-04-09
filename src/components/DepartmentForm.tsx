
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
  deptcode: z.string().min(1, "Department code is required"),
  deptname: z.string().min(1, "Department name is required"),
});

type FormValues = z.infer<typeof formSchema>;

type DepartmentFormProps = {
  department?: {
    deptcode: string;
    deptname: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
  isEdit?: boolean;
};

export default function DepartmentForm({ department, onSuccess, onCancel, isEdit = false }: DepartmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deptcode: department?.deptcode || "",
      deptname: department?.deptname || "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      if (isEdit) {
        // Update existing department
        const { error } = await supabase
          .from("department")
          .update({
            deptname: data.deptname
          })
          .eq("deptcode", department?.deptcode);

        if (error) throw error;
        toast.success("Department updated successfully");
      } else {
        // Create new department
        const { error } = await supabase
          .from("department")
          .insert({
            deptcode: data.deptcode,
            deptname: data.deptname
          });

        if (error) {
          if (error.code === "23505") {
            toast.error("A department with this code already exists");
            setIsLoading(false);
            return;
          }
          throw error;
        }
        toast.success("Department added successfully");
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
          name="deptcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Code</FormLabel>
              <FormControl>
                <Input {...field} disabled={isEdit} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deptname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Name</FormLabel>
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
            {isEdit ? "Update" : "Add"} Department
          </Button>
        </div>
      </form>
    </Form>
  );
}
