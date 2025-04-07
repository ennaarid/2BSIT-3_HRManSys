
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

// Mock data for job history
const jobHistory = [
  {
    id: 1,
    employeeId: 1,
    employeeName: "John Doe",
    startDate: "2020-01-15",
    endDate: "2021-06-30",
    jobTitle: "Junior Software Engineer",
    department: "Engineering",
    salary: 75000,
  },
  {
    id: 2,
    employeeId: 1,
    employeeName: "John Doe",
    startDate: "2021-07-01",
    endDate: null,
    jobTitle: "Software Engineer",
    department: "Engineering",
    salary: 85000,
  },
  {
    id: 3,
    employeeId: 2,
    employeeName: "Jane Smith",
    startDate: "2019-05-20",
    endDate: "2020-12-31",
    jobTitle: "HR Specialist",
    department: "Human Resources",
    salary: 65000,
  },
  {
    id: 4,
    employeeId: 2,
    employeeName: "Jane Smith",
    startDate: "2021-01-01",
    endDate: null,
    jobTitle: "HR Manager",
    department: "Human Resources",
    salary: 78000,
  },
  {
    id: 5,
    employeeId: 3,
    employeeName: "Robert Johnson",
    startDate: "2021-03-10",
    endDate: null,
    jobTitle: "Marketing Specialist",
    department: "Marketing",
    salary: 65000,
  },
  {
    id: 6,
    employeeId: 4,
    employeeName: "Emily Wilson",
    startDate: "2018-09-15",
    endDate: "2020-05-30",
    jobTitle: "Sales Associate",
    department: "Sales",
    salary: 55000,
  },
  {
    id: 7,
    employeeId: 4,
    employeeName: "Emily Wilson",
    startDate: "2020-06-01",
    endDate: "2022-01-15",
    jobTitle: "Sales Representative",
    department: "Sales",
    salary: 62000,
  },
  {
    id: 8,
    employeeId: 4,
    employeeName: "Emily Wilson",
    startDate: "2022-01-16",
    endDate: null,
    jobTitle: "Sales Manager",
    department: "Sales",
    salary: 85000,
  },
];

const JobHistory = () => {
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
                  <TableHead>End Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Salary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{record.jobTitle}</TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>{formatDate(record.startDate)}</TableCell>
                    <TableCell>{formatDate(record.endDate)}</TableCell>
                    <TableCell>
                      {calculateDuration(record.startDate, record.endDate)}
                    </TableCell>
                    <TableCell>${record.salary.toLocaleString()}</TableCell>
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

export default JobHistory;
