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
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import EmployeeForm from "@/components/EmployeeForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Employee = {
  id: number;
  empno: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string; 
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employee')
        .select('*');

      if (error) {
        throw error;
      }

      const transformedEmployees: Employee[] = data.map(emp => ({
        id: parseInt(emp.empno),
        empno: emp.empno,
        firstName: emp.firstname || '',
        lastName: emp.lastname || '',
        hireDate: emp.hiredate || '',
        birthdate: emp.birthdate,
        gender: emp.gender,
        sepdate: emp.sepdate,
        email: '',
        phone: '',
        jobTitle: '',
        department: '',
        salary: 0
      }));

      setEmployees(transformedEmployees);
      setFilteredEmployees(transformedEmployees);
    } catch (error: any) {
      toast.error('Error fetching employees: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const results = employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        employee.empno.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredEmployees(results);
  }, [searchTerm, employees]);

  const handleAddEmployee = async (employee: Employee | Omit<Employee, "id">) => {
    try {
      setIsSubmitting(true);
      
      const { firstName, lastName, hireDate, empno } = employee;
      
      const { data, error } = await supabase
        .from('employee')
        .insert([
          { 
            empno: empno,
            firstname: firstName,
            lastname: lastName,
            hiredate: hireDate,
            gender: employee.gender || null,
            birthdate: employee.birthdate || null
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast.success("Employee added successfully!");
      await fetchEmployees();
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast.error('Error adding employee: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmployee = async (employee: Employee | Omit<Employee, "id">) => {
    try {
      setIsSubmitting(true);
      
      if ('id' in employee && currentEmployee) {
        const { firstName, lastName, hireDate, gender, birthdate, sepdate } = employee;
        
        const { error } = await supabase
          .from('employee')
          .update({ 
            firstname: firstName,
            lastname: lastName,
            hiredate: hireDate,
            gender: gender || null,
            birthdate: birthdate || null,
            sepdate: sepdate || null
          })
          .eq('empno', currentEmployee.empno);
        
        if (error) throw error;
        
        toast.success("Employee updated successfully!");
        await fetchEmployees();
        setIsEditDialogOpen(false);
      }
    } catch (error: any) {
      toast.error('Error updating employee: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      setIsSubmitting(true);
      
      if (currentEmployee) {
        const { error } = await supabase
          .from('employee')
          .delete()
          .eq('empno', currentEmployee.empno);
        
        if (error) throw error;
        
        toast.success("Employee deleted successfully!");
        await fetchEmployees();
        setIsDeleteDialogOpen(false);
      }
    } catch (error: any) {
      toast.error('Error deleting employee: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Employees</h2>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#279F49] hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search employees by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full max-w-sm"
          />
        </div>

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
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
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
                    {searchTerm ? 'No matching employees found' : 'No employees found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>

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
                isSubmitting={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>

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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEmployee}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
