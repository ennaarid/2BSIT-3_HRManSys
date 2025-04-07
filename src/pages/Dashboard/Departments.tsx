
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Mock data for departments
const departments = [
  {
    id: 1,
    name: "Engineering",
    manager: "John Smith",
    location: "Building A, Floor 3",
    employeeCount: 28,
    budget: 1500000,
  },
  {
    id: 2,
    name: "Marketing",
    manager: "Sarah Johnson",
    location: "Building B, Floor 2",
    employeeCount: 15,
    budget: 800000,
  },
  {
    id: 3,
    name: "Human Resources",
    manager: "David Brown",
    location: "Building A, Floor 1",
    employeeCount: 8,
    budget: 400000,
  },
  {
    id: 4,
    name: "Finance",
    manager: "Lisa Wong",
    location: "Building C, Floor 4",
    employeeCount: 12,
    budget: 650000,
  },
  {
    id: 5,
    name: "Sales",
    manager: "Michael Adams",
    location: "Building B, Floor 1",
    employeeCount: 20,
    budget: 1200000,
  },
];

const Departments = () => {
  const handleEditDepartment = (id: number) => {
    toast.info("Please connect Supabase to enable department editing");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Departments</h2>
          <Button 
            className="bg-hr-blue hover:bg-blue-700"
            onClick={() => toast.info("Please connect Supabase to add departments")}
          >
            Add Department
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.slice(0, 3).map((dept) => (
            <Card key={dept.id}>
              <CardHeader className="pb-2">
                <CardTitle>{dept.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  Manager: {dept.manager}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{dept.employeeCount}</div>
                  <div className="text-sm text-muted-foreground">Employees</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.manager}</TableCell>
                    <TableCell>{dept.location}</TableCell>
                    <TableCell>{dept.employeeCount}</TableCell>
                    <TableCell>
                      ${dept.budget.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditDepartment(dept.id)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Departments;
