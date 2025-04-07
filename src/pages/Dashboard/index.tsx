
import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import EmployeeForm from "@/components/EmployeeForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Update Employee type to match both components
type Employee = {
  id: number;
  empno: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string; // Changed from hiredate to hireDate to match EmployeeForm
  jobTitle: string;
  department: string;
  salary: number;
  birthdate?: string;
  gender?: string;
  sepdate?: string;
};

const Dashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch employees from Supabase
  useEffect(() => {
    async function fetchEmployees() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('employee')
          .select('*');

        if (error) {
          throw error;
        }

        // Transform the data to match our expected Employee type
        const transformedEmployees: Employee[] = data.map(emp => ({
          id: parseInt(emp.empno),
          empno: emp.empno,
          firstName: emp.firstname || '',
          lastName: emp.lastname || '',
          hireDate: emp.hiredate || '', // Changed from hiredate to hireDate
          birthdate: emp.birthdate,
          gender: emp.gender,
          sepdate: emp.sepdate,
          // Add required properties from EmployeeForm that may not exist in DB
          email: '',
          phone: '',
          jobTitle: '',
          department: '',
          salary: 0
        }));

        setEmployees(transformedEmployees);
      } catch (error: any) {
        toast.error('Error fetching employees: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmployees();
  }, []);

  // Fix the parameter type for handleAddEmployee
  const handleAddEmployee = (employee: Employee | Omit<Employee, "id">) => {
    // In a real implementation, this would add the employee to Supabase
    toast.info("Please implement this functionality to add employees to Supabase");
    setIsAddDialogOpen(false);
  };

  // Fix the parameter type for handleEditEmployee
  const handleEditEmployee = (employee: Employee | Omit<Employee, "id">) => {
    // In a real implementation, this would update the employee in Supabase
    toast.info("Please implement this functionality to update employees in Supabase");
    setIsEditDialogOpen(false);
  };

  const handleDeleteEmployee = () => {
    // In a real implementation, this would delete the employee from Supabase
    toast.info("Please implement this functionality to delete employees from Supabase");
    setIsDeleteDialogOpen(false);
  };

  const openEditDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const displayEmployees = isSearching ? searchResults : employees;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Employees</h2>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-hr-blue hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Employee table */}
        <div className="bg-white rounded-md shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayEmployees.length > 0 ? (
                displayEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.empno}</TableCell>
                    <TableCell>
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{employee.gender || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => openDeleteDialog(employee)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Employee Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the details of the new employee.
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm
              onSubmit={handleAddEmployee}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>Update employee information.</DialogDescription>
            </DialogHeader>
            {currentEmployee && (
              <EmployeeForm
                employee={currentEmployee}
                onSubmit={handleEditEmployee}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this employee? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEmployee}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
