
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DepartmentForm from "@/components/DepartmentForm";
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

type Department = {
  deptcode: string;
  deptname: string | null;
  employeeCount?: number;
};

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      
      // Fetch departments
      const { data, error } = await supabase
        .from('department')
        .select('*');

      if (error) throw error;

      // Fetch job history to count employees per department
      const { data: jobHistoryData, error: jobHistoryError } = await supabase
        .from('jobhistory')
        .select('deptcode, empno');

      if (jobHistoryError) throw jobHistoryError;

      // Count unique employees per department
      const counts: Record<string, Set<string>> = {};
      jobHistoryData.forEach((record) => {
        if (record.deptcode) {
          if (!counts[record.deptcode]) counts[record.deptcode] = new Set();
          counts[record.deptcode].add(record.empno);
        }
      });

      // Convert sets to counts
      const employeeCountsMap: Record<string, number> = {};
      Object.entries(counts).forEach(([deptcode, employees]) => {
        employeeCountsMap[deptcode] = employees.size;
      });

      setEmployeeCounts(employeeCountsMap);
      setDepartments(data);
    } catch (error: any) {
      toast.error('Error fetching departments: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = () => {
    setEditDepartment(null);
    setFormOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditDepartment(department);
    setFormOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDepartment = async () => {
    if (!departmentToDelete) return;
    
    setIsDeleting(true);
    try {
      // Check if department is in use in jobhistory
      const { data: jobHistoryData, error: checkError } = await supabase
        .from('jobhistory')
        .select('deptcode')
        .eq('deptcode', departmentToDelete.deptcode)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (jobHistoryData.length > 0) {
        toast.error("Cannot delete department as it is being used by employees");
        return;
      }
      
      const { error } = await supabase
        .from('department')
        .delete()
        .eq('deptcode', departmentToDelete.deptcode);
      
      if (error) throw error;
      
      toast.success("Department deleted successfully");
      fetchDepartments();
    } catch (error: any) {
      toast.error(`Error deleting department: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    fetchDepartments();
  };

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
          <h2 className="text-2xl font-bold">Departments</h2>
          <Button 
            className="bg-hr-blue hover:bg-blue-700"
            onClick={handleAddDepartment}
          >
            Add Department
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.slice(0, 3).map((dept) => (
            <Card key={dept.deptcode}>
              <CardHeader className="pb-2">
                <CardTitle>{dept.deptname || dept.deptcode}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold">{employeeCounts[dept.deptcode] || 0}</div>
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
                  <TableHead>Department Code</TableHead>
                  <TableHead>Department Name</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.deptcode}>
                    <TableCell className="font-medium">{dept.deptcode}</TableCell>
                    <TableCell>{dept.deptname || 'N/A'}</TableCell>
                    <TableCell>{employeeCounts[dept.deptcode] || 0}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditDepartment(dept)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteDepartment(dept)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Department Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editDepartment ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          {formOpen && (
            <DepartmentForm
              department={editDepartment || undefined}
              isEdit={!!editDepartment}
              onSuccess={handleFormSuccess}
              onCancel={() => setFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the department{' '}
              <strong>{departmentToDelete?.deptname || departmentToDelete?.deptcode}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDeleteDepartment();
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
    </DashboardLayout>
  );
};

export default Departments;
