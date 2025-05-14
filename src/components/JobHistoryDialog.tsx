
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JobHistory {
  empno: string;
  effdate: string;
  jobcode: string;
  deptcode: string;
  salary: number;
}

interface JobHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  employee: {
    empno: string;
    firstName: string;
    lastName: string;
  };
}

// Alternative props format for the Dashboard component
export interface AlternativeJobHistoryProps {
  empno: string;
  isOpen: boolean;
  onClose: () => void;
}

const JobHistoryDialog = (props: JobHistoryDialogProps | AlternativeJobHistoryProps) => {
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Convert alternative props format to standard format
  const { open, onClose, employee } = 'isOpen' in props 
    ? { 
        open: props.isOpen, 
        onClose: props.onClose, 
        employee: { 
          empno: props.empno,
          firstName: '',
          lastName: ''
        } 
      } 
    : props;

  useEffect(() => {
    if (open && employee.empno) {
      fetchJobHistory();
    }
  }, [open, employee.empno]);

  const fetchJobHistory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('jobhistory')
        .select(`
          empno,
          effdate,
          jobcode,
          deptcode,
          salary,
          job (jobdesc),
          department (deptname)
        `)
        .eq('empno', employee.empno)
        .order('effdate', { ascending: false });

      if (error) throw error;
      setJobHistory(data || []);
    } catch (error: any) {
      toast.error('Error fetching job history: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(salary);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Job History</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Employee Number</p>
              <p>{employee.empno}</p>
            </div>
            {'firstName' in employee && 'lastName' in employee && (
              <div>
                <p className="text-sm font-medium">Employee Name</p>
                <p>{`${employee.lastName}, ${employee.firstName}`}</p>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Effectivity Date</TableHead>
                <TableHead>Job Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobHistory.map((history, index) => (
                <TableRow key={`${history.empno}-${history.effdate}`}>
                  <TableCell>{formatDate(history.effdate)}</TableCell>
                  <TableCell>{history.jobcode}</TableCell>
                  <TableCell>{history.deptcode}</TableCell>
                  <TableCell>{formatSalary(history.salary)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end space-x-2">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobHistoryDialog;
