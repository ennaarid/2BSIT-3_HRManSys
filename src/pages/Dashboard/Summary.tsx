
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmployeesChart } from "@/components/charts/EmployeesChart";
import { JobsChart } from "@/components/charts/JobsChart";
import { DepartmentsChart } from "@/components/charts/DepartmentsChart";
import { SalaryTrendsChart } from "@/components/charts/SalaryTrendsChart";

const DashboardSummary = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    avgSalary: 0,
    departmentCount: 0,
    jobCount: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch employee count
        const { count: employeeCount, error: empError } = await supabase
          .from('employee')
          .select('*', { count: 'exact', head: true });

        if (empError) throw empError;

        // Fetch average salary
        const { data: salaryData, error: salaryError } = await supabase
          .from('jobhistory')
          .select('salary');

        if (salaryError) throw salaryError;

        // Calculate average salary
        const validSalaries = salaryData.filter(item => item.salary !== null).map(item => item.salary) as number[];
        const avgSalary = validSalaries.length > 0
          ? validSalaries.reduce((sum, val) => sum + val, 0) / validSalaries.length
          : 0;

        // Fetch department count
        const { count: deptCount, error: deptError } = await supabase
          .from('department')
          .select('*', { count: 'exact', head: true });

        if (deptError) throw deptError;

        // Fetch job count
        const { count: jobCount, error: jobError } = await supabase
          .from('job')
          .select('*', { count: 'exact', head: true });

        if (jobError) throw jobError;

        setStats({
          totalEmployees: employeeCount || 0,
          avgSalary: Math.round(avgSalary),
          departmentCount: deptCount || 0,
          jobCount: jobCount || 0,
        });
      } catch (error: any) {
        toast.error('Error fetching dashboard data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          <h2 className="text-2xl font-bold">Dashboard Summary</h2>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Average Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.avgSalary.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.departmentCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Job Titles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.jobCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="salaries">Salary Trends</TabsTrigger>
          </TabsList>
          <TabsContent value="employees" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Employee Demographics</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[400px]">
                  <EmployeesChart />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="departments" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[400px]">
                  <DepartmentsChart />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="jobs" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Job Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[400px]">
                  <JobsChart />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="salaries" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Salary Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[400px]">
                  <SalaryTrendsChart />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSummary;
