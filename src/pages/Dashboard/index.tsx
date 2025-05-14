
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeForm from "@/components/EmployeeForm";
import JobHistoryDialog from "@/components/JobHistoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useTableState } from "@/hooks/useTableState";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Employee = {
  empno: string;
  firstname: string | null;
  lastname: string | null;
  birthdate: string | null;
  hiredate: string | null;
  sepdate: string | null;
  gender: string | null;
  status?: string;
  stamp?: string;
};

const Dashboard = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [jobHistoryOpen, setJobHistoryOpen] = useState(false);
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState<string | null>(null);

  // Get user role to determine if user is admin
  const { isAdmin } = useUserRole();
  
  // Get table permissions
  const { canAdd, canEdit, canDelete } = useTableState('employee');

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase.from("employee").select("*");
      
      // Regular users shouldn't see deleted records
      if (!isAdmin) {
        query = query.not('status', 'eq', 'deleted');
      }
      
      const { data, error } = await query.order("lastname", { ascending: true });

      if (error) {
        throw error;
      }

      setEmployees(data);
    } catch (error: any) {
      toast.error("Error fetching employees: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setEmployeeFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeFormOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("employee")
        .delete()
        .eq("empno", employeeToDelete.empno);
      
      if (error) throw error;
      
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error: any) {
      toast.error("Error deleting employee: " + error.message);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setEmployeeFormOpen(false);
    fetchEmployees();
  };

  const handleOpenJobHistory = (empno: string) => {
    setSelectedEmployeeForHistory(empno);
    setJobHistoryOpen(true);
  };

  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
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
          {canAdd && (
            <Button 
              onClick={handleAddEmployee}
              className="bg-hr-blue hover:bg-blue-700"
            >
              Add Employee
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Birth Date</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Separation Date</TableHead>
                  {isAdmin && <TableHead>Status</TableHead>}
                  {isAdmin && <TableHead>Last Updated</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow 
                    key={employee.empno}
                    className={employee.status === 'deleted' ? 'bg-red-50' : ''}
                  >
                    <TableCell className="font-medium">{employee.empno}</TableCell>
                    <TableCell>
                      {`${employee.lastname || ''}, ${employee.firstname || ''}`}
                    </TableCell>
                    <TableCell>{employee.gender || "N/A"}</TableCell>
                    <TableCell>{formatDate(employee.birthdate)}</TableCell>
                    <TableCell>{formatDate(employee.hiredate)}</TableCell>
                    <TableCell>{formatDate(employee.sepdate)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <span className={`
                          px-2 py-1 text-xs rounded-full
                          ${employee.status === 'added' ? 'bg-green-100 text-green-800' : ''}
                          ${employee.status === 'edited' ? 'bg-blue-100 text-blue-800' : ''}
                          ${employee.status === 'deleted' ? 'bg-red-100 text-red-800' : ''}
                          ${employee.status === 'restored' ? 'bg-amber-100 text-amber-800' : ''}
                        `}>
                          {employee.status || 'added'}
                        </span>
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell>
                        {employee.stamp ? new Date(employee.stamp).toLocaleString() : 'N/A'}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenJobHistory(employee.empno)}
                        >
                          Job History
                        </Button>
                        {canEdit && employee.status !== 'deleted' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        {canDelete && employee.status !== 'deleted' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee)}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={employeeFormOpen} onOpenChange={setEmployeeFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            employee={selectedEmployee || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setEmployeeFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the employee record for{" "}
              <strong>
                {employeeToDelete?.firstname} {employeeToDelete?.lastname}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteEmployee();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Job History Dialog */}
      {selectedEmployeeForHistory && (
        <JobHistoryDialog
          empno={selectedEmployeeForHistory}
          isOpen={jobHistoryOpen}
          onClose={() => {
            setJobHistoryOpen(false);
            setSelectedEmployeeForHistory(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
