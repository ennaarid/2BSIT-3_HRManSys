
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
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
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
import JobForm from "@/components/JobForm";

type Job = {
  jobcode: string;
  jobdesc: string | null;
  avgSalary?: number;
  employeeCount?: number;
};

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobStats, setJobStats] = useState<Record<string, { count: number, avgSalary: number }>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      
      // Fetch jobs
      const { data, error } = await supabase
        .from('job')
        .select('*');

      if (error) throw error;

      // Fetch job history to get salary data and employee counts
      const { data: jobHistoryData, error: jobHistoryError } = await supabase
        .from('jobhistory')
        .select('jobcode, empno, salary');

      if (jobHistoryError) throw jobHistoryError;

      // Calculate stats per job
      const stats: Record<string, { employees: Set<string>, salaries: number[], count: number }> = {};
      jobHistoryData.forEach((record) => {
        if (!stats[record.jobcode]) {
          stats[record.jobcode] = {
            employees: new Set(),
            salaries: [],
            count: 0
          };
        }
        
        stats[record.jobcode].employees.add(record.empno);
        if (record.salary) stats[record.jobcode].salaries.push(record.salary);
        stats[record.jobcode].count += 1;
      });

      // Convert to final format
      const jobStatsMap: Record<string, { count: number, avgSalary: number }> = {};
      Object.entries(stats).forEach(([jobcode, data]) => {
        const avgSalary = data.salaries.length > 0 
          ? data.salaries.reduce((sum, val) => sum + val, 0) / data.salaries.length 
          : 0;
        
        jobStatsMap[jobcode] = {
          count: data.employees.size,
          avgSalary
        };
      });

      setJobStats(jobStatsMap);
      setJobs(data);
    } catch (error: any) {
      toast.error('Error fetching jobs: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAddJob = () => {
    setIsAddDialogOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const handleDeleteJob = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedJob) return;
    
    try {
      // Check if job is being used in job history
      const { count, error: countError } = await supabase
        .from('jobhistory')
        .select('jobcode', { count: 'exact', head: true })
        .eq('jobcode', selectedJob.jobcode);
      
      if (countError) throw countError;
      
      if (count && count > 0) {
        toast.error(`Cannot delete job: It is currently assigned to ${count} employee records`);
        return;
      }
      
      const { error } = await supabase
        .from('job')
        .delete()
        .eq('jobcode', selectedJob.jobcode);
        
      if (error) throw error;
      
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error: any) {
      toast.error(`Error deleting job: ${error.message}`);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Calculate total number of employees across all jobs
  const totalEmployees = Object.values(jobStats).reduce((sum, stat) => sum + stat.count, 0);
  
  // Calculate average salary across all jobs
  const allSalaries = Object.values(jobStats)
    .filter(stat => stat.avgSalary > 0)
    .map(stat => stat.avgSalary);
  const overallAvgSalary = allSalaries.length > 0 
    ? allSalaries.reduce((sum, val) => sum + val, 0) / allSalaries.length 
    : 0;

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
          <h2 className="text-2xl font-bold">Jobs</h2>
          <Button 
            className="bg-hr-blue hover:bg-blue-700"
            onClick={handleAddJob}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Job
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
              <CardTitle className="text-md font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalEmployees}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md font-medium">Average Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${Math.round(overallAvgSalary).toLocaleString()}
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
                  <TableHead>Job Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Avg. Salary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.jobcode}>
                    <TableCell className="font-medium">{job.jobcode}</TableCell>
                    <TableCell>{job.jobdesc || 'N/A'}</TableCell>
                    <TableCell>{jobStats[job.jobcode]?.count || 0}</TableCell>
                    <TableCell>
                      {jobStats[job.jobcode]?.avgSalary 
                        ? `$${Math.round(jobStats[job.jobcode].avgSalary).toLocaleString()}`
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditJob(job)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteJob(job)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add Job Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Job</DialogTitle>
          </DialogHeader>
          <JobForm 
            onSuccess={() => {
              setIsAddDialogOpen(false);
              fetchJobs();
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <JobForm 
              job={selectedJob}
              isEdit
              onSuccess={() => {
                setIsEditDialogOpen(false);
                fetchJobs();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the job {selectedJob?.jobcode}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Jobs;
