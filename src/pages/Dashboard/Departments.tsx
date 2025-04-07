
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
import { Loader2 } from "lucide-react";

type Department = {
  deptcode: string;
  deptname: string | null;
  employeeCount?: number;
};

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchDepartments() {
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
    }

    fetchDepartments();
  }, []);

  const handleEditDepartment = (deptcode: string) => {
    toast.info("Please implement this functionality to edit departments in Supabase");
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
            onClick={() => toast.info("Please implement this functionality to add departments in Supabase")}
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditDepartment(dept.deptcode)}
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
