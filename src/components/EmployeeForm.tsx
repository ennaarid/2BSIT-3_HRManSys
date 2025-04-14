
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, History } from "lucide-react";
import JobHistoryDialog from "./JobHistoryDialog";

interface Employee {
  id: number;
  empno: string;
  firstName: string;
  lastName: string;
  hireDate: string;
  sepdate?: string;
}

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (employee: Employee | Omit<Employee, 'id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EmployeeForm = ({
  employee,
  onSubmit,
  onCancel,
  isSubmitting = false
}: EmployeeFormProps) => {
  const [formData, setFormData] = useState<Omit<Employee, 'id'> | Employee>({
    id: employee?.id || 0,
    empno: employee?.empno || "",
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    hireDate: employee?.hireDate || new Date().toISOString().split("T")[0],
    sepdate: employee?.sepdate || "",
  });

  const [isJobHistoryOpen, setIsJobHistoryOpen] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.empno
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="empno">Employee ID*</Label>
          <Input
            id="empno"
            name="empno"
            value={formData.empno}
            onChange={handleChange}
            disabled={!!employee}
            required
          />
        </div>
      
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name*</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name*</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hireDate">Hire Date*</Label>
            <Input
              id="hireDate"
              name="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sepdate">Separation Date</Label>
            <Input
              id="sepdate"
              name="sepdate"
              type="date"
              value={formData.sepdate}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsJobHistoryOpen(true)}
            disabled={!employee}
          >
            <History className="h-4 w-4" />
            Manage Job History
          </Button>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-hr-blue hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {employee ? "Updating..." : "Adding..."}
                </>
              ) : (
                employee ? "Update" : "Add Employee"
              )}
            </Button>
          </div>
        </div>
      </form>

      {employee && (
        <JobHistoryDialog
          open={isJobHistoryOpen}
          onClose={() => setIsJobHistoryOpen(false)}
          employee={{
            empno: employee.empno,
            firstName: employee.firstName,
            lastName: employee.lastName
          }}
        />
      )}
    </>
  );
};

export default EmployeeForm;
