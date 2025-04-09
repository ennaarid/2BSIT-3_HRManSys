
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type JobHistory = {
  empno: string;
  jobcode: string;
  deptcode: string | null;
  effdate: string;
  salary: number | null;
  employeeName?: string;
  jobTitle?: string;
  department?: string;
};

const JobHistoryPage = () => {
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<{ [key: string]: { firstname: string, lastname: string } }>({});
  const [jobs, setJobs] = useState<{ [key: string]: { jobdesc: string } }>({});
  const [departments, setDepartments] = useState<{ [key: string]: { deptname: string } }>({});

  // Function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Calculate duration
  const calculateDuration = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    }
  };

  // Fetch all required data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch job history
        const { data: historyData, error: historyError } = await supabase
          .from('jobhistory')
          .select('*')
          .order('effdate', { ascending: false });

        if (historyError) throw historyError;

        // Fetch employees
        const { data: employeeData, error: employeeError } = await supabase
          .from('employee')
          .select('empno, firstname, lastname');

        if (employeeError) throw employeeError;

        // Convert employee data to a lookup map
        const employeeMap: { [key: string]: { firstname: string, lastname: string } } = {};
        employeeData.forEach((emp) => {
          employeeMap[emp.empno] = { firstname: emp.firstname, lastname: emp.lastname };
        });

        // Fetch jobs
        const { data: jobData, error: jobError } = await supabase
          .from('job')
          .select('jobcode, jobdesc');

        if (jobError) throw jobError;

        // Convert job data to a lookup map
        const jobMap: { [key: string]: { jobdesc: string } } = {};
        jobData.forEach((job) => {
          jobMap[job.jobcode] = { jobdesc: job.jobdesc };
        });

        // Fetch departments
        const { data: deptData, error: deptError } = await supabase
          .from('department')
          .select('deptcode, deptname');

        if (deptError) throw deptError;

        // Convert department data to a lookup map
        const deptMap: { [key: string]: { deptname: string } } = {};
        deptData.forEach((dept) => {
          deptMap[dept.deptcode] = { deptname: dept.deptname };
        });

        setEmployees(employeeMap);
        setJobs(jobMap);
        setDepartments(deptMap);
        setJobHistory(historyData);
      } catch (error: any) {
        toast.error('Error fetching data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" /> {/* Changed from blue to green */}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Job History</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Job History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobHistory.length > 0 ? (
                  jobHistory.map((record, index) => (
                    <TableRow key={`${record.empno}-${record.jobcode}-${record.effdate}-${index}`}>
                      <TableCell>
                        {employees[record.empno] 
                          ? `${employees[record.empno].firstname} ${employees[record.empno].lastname}` 
                          : record.empno}
                      </TableCell>
                      <TableCell>
                        {jobs[record.jobcode]?.jobdesc || record.jobcode}
                      </TableCell>
                      <TableCell>
                        {record.deptcode && departments[record.deptcode]
                          ? departments[record.deptcode].deptname
                          : (record.deptcode || 'N/A')}
                      </TableCell>
                      <TableCell>{formatDate(record.effdate)}</TableCell>
                      <TableCell>
                        {record.salary ? `$${record.salary.toLocaleString()}` : 'N/A'}
                      </TableCell>
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JobHistoryPage;
