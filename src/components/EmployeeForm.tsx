
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
  jobTitle: string;
  department: string;
  salary: number;
  empno?: string;
  birthdate?: string;
  gender?: string;
  sepdate?: string;
}

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (employee: Employee | Omit<Employee, 'id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const jobTitles = [
  "Software Engineer",
  "HR Manager",
  "Marketing Specialist",
  "Sales Representative",
  "Project Manager",
  "Data Analyst",
  "Product Designer",
];

const departments = [
  "Engineering",
  "Human Resources",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "Product",
];

const genders = [
  "M",
  "F",
  "O",
];

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<Omit<Employee, 'id'> | Employee>({
    id: employee?.id || 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hireDate: new Date().toISOString().split("T")[0],
    jobTitle: "",
    department: "",
    salary: 0,
    empno: employee?.empno || "",
    gender: employee?.gender || "",
    birthdate: employee?.birthdate || "",
    sepdate: employee?.sepdate || "",
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        birthdate: employee.birthdate || "",
        gender: employee.gender || "",
        sepdate: employee.sepdate || "",
      });
    } else {
      // Generate a unique employee number for new employees
      setFormData(prev => ({
        ...prev,
        empno: `EMP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      }));
    }
  }, [employee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
      !formData.email ||
      !formData.department ||
      !formData.jobTitle ||
      !formData.empno
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="empno">Employee ID*</Label>
        <Input
          id="empno"
          name="empno"
          value={formData.empno}
          onChange={handleChange}
          disabled={!!employee} // Disable editing for existing employees
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
      
      <div className="space-y-2">
        <Label htmlFor="email">Email*</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleSelectChange("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="birthdate">Birth Date</Label>
          <Input
            id="birthdate"
            name="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={handleChange}
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
        {employee && (
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
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department*</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleSelectChange("department", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title*</Label>
          <Select
            value={formData.jobTitle}
            onValueChange={(value) => handleSelectChange("jobTitle", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job title" />
            </SelectTrigger>
            <SelectContent>
              {jobTitles.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="salary">Salary</Label>
        <Input
          id="salary"
          name="salary"
          type="number"
          value={formData.salary}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
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
    </form>
  );
};

export default EmployeeForm;
