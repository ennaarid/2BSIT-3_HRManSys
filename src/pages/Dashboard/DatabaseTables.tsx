
import { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

const DatabaseTables = () => {
  const [activeTab, setActiveTab] = useState("employees");

  // Fetch employees
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employee").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch job history
  const { data: jobHistory, isLoading: jobHistoryLoading } = useQuery({
    queryKey: ["jobHistory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobhistory").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch departments
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("department").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Database Tables</h2>
        
        <Tabs defaultValue="employees" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="jobhistory">Job History</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>

          {/* Employees Tab */}
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Records</CardTitle>
              </CardHeader>
              <CardContent>
                {employeesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Birth Date</TableHead>
                        <TableHead>Hire Date</TableHead>
                        <TableHead>Separation Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees && employees.length > 0 ? (
                        employees.map((employee) => (
                          <TableRow key={employee.empno}>
                            <TableCell className="font-medium">{employee.empno}</TableCell>
                            <TableCell>{employee.firstname || 'N/A'}</TableCell>
                            <TableCell>{employee.lastname || 'N/A'}</TableCell>
                            <TableCell>{employee.gender || 'N/A'}</TableCell>
                            <TableCell>{formatDate(employee.birthdate)}</TableCell>
                            <TableCell>{formatDate(employee.hiredate)}</TableCell>
                            <TableCell>{formatDate(employee.sepdate)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No employee records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job History Tab */}
          <TabsContent value="jobhistory">
            <Card>
              <CardHeader>
                <CardTitle>Job History Records</CardTitle>
              </CardHeader>
              <CardContent>
                {jobHistoryLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Job Code</TableHead>
                        <TableHead>Dept Code</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Salary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobHistory && jobHistory.length > 0 ? (
                        jobHistory.map((record, index) => (
                          <TableRow key={`${record.empno}-${record.jobcode}-${record.effdate}-${index}`}>
                            <TableCell className="font-medium">{record.empno}</TableCell>
                            <TableCell>{record.jobcode}</TableCell>
                            <TableCell>{record.deptcode || 'N/A'}</TableCell>
                            <TableCell>{formatDate(record.effdate)}</TableCell>
                            <TableCell>{record.salary ? `$${record.salary.toLocaleString()}` : 'N/A'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No job history records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Department Records</CardTitle>
              </CardHeader>
              <CardContent>
                {departmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department Code</TableHead>
                        <TableHead>Department Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments && departments.length > 0 ? (
                        departments.map((department) => (
                          <TableRow key={department.deptcode}>
                            <TableCell className="font-medium">{department.deptcode}</TableCell>
                            <TableCell>{department.deptname || 'N/A'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4">
                            No department records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Job Records</CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Code</TableHead>
                        <TableHead>Job Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs && jobs.length > 0 ? (
                        jobs.map((job) => (
                          <TableRow key={job.jobcode}>
                            <TableCell className="font-medium">{job.jobcode}</TableCell>
                            <TableCell>{job.jobdesc || 'N/A'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4">
                            No job records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DatabaseTables;
