
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

// Mock data for jobs
const jobs = [
  {
    id: 1,
    title: "Software Engineer",
    minSalary: 80000,
    maxSalary: 120000,
    department: "Engineering",
    openPositions: 3,
  },
  {
    id: 2,
    title: "HR Manager",
    minSalary: 70000,
    maxSalary: 95000,
    department: "Human Resources",
    openPositions: 1,
  },
  {
    id: 3,
    title: "Marketing Specialist",
    minSalary: 60000,
    maxSalary: 85000,
    department: "Marketing",
    openPositions: 2,
  },
  {
    id: 4,
    title: "Sales Representative",
    minSalary: 50000,
    maxSalary: 90000,
    department: "Sales",
    openPositions: 5,
  },
  {
    id: 5,
    title: "Financial Analyst",
    minSalary: 75000,
    maxSalary: 95000,
    department: "Finance",
    openPositions: 2,
  },
  {
    id: 6,
    title: "Project Manager",
    minSalary: 85000,
    maxSalary: 130000,
    department: "Engineering",
    openPositions: 1,
  },
  {
    id: 7,
    title: "Data Scientist",
    minSalary: 90000,
    maxSalary: 140000,
    department: "Engineering",
    openPositions: 2,
  },
  {
    id: 8,
    title: "Product Designer",
    minSalary: 80000,
    maxSalary: 110000,
    department: "Product",
    openPositions: 1,
  }
];

const Jobs = () => {
  const handleEditJob = (id: number) => {
    toast.info("Please connect Supabase to enable job editing");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Jobs</h2>
          <Button 
            className="bg-hr-blue hover:bg-blue-700"
            onClick={() => toast.info("Please connect Supabase to add jobs")}
          >
            Add Job
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Total Job Titles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{jobs.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {jobs.reduce((total, job) => total + job.openPositions, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Average Max Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${Math.round(jobs.reduce((sum, job) => sum + job.maxSalary, 0) / jobs.length).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Salary Range</TableHead>
                  <TableHead>Open Positions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.department}</TableCell>
                    <TableCell>
                      ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>{job.openPositions}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditJob(job.id)}
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

export default Jobs;
