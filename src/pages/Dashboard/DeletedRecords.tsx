import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw, Key } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type DeletedRecord = {
  id: string;
  displayName: string;
  tableName: string;
  deletedAt: string;
};

type EmployeeRecord = {
  empno: string;
  firstname?: string | null;
  lastname?: string | null;
  status?: string;
  stamp?: string;
};

type JobRecord = {
  jobcode: string;
  jobdesc?: string | null;
  status?: string;
  stamp?: string;
};

type DepartmentRecord = {
  deptcode: string;
  deptname?: string | null;
  status?: string;
  stamp?: string;
};

type JobHistoryRecord = {
  empno: string;
  jobcode: string;
  effdate: string;
  status?: string;
  stamp?: string;
};

export default function DeletedRecords() {
  const { isAdmin, restoreRecord } = useUserRole();
  const [activeTab, setActiveTab] = useState('employee');
  const [deletedRecords, setDeletedRecords] = useState<DeletedRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeletedRecords = async (tableName: string) => {
    try {
      setLoading(true);
      
      // Get all records with status 'deleted'
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('status', 'deleted');
      
      if (error) throw error;

      if (!data || data.length === 0) {
        setDeletedRecords([]);
        return;
      }

      const formattedRecords: DeletedRecord[] = data.map(record => {
        let recordId = '';
        let displayName = 'Unknown Record';
        
        // Type narrowing based on tableName
        if (tableName === 'employee') {
          const empRecord = record as unknown as EmployeeRecord;
          recordId = empRecord.empno;
          displayName = `${empRecord.lastname || ''} ${empRecord.firstname || ''} (${empRecord.empno})`;
        } 
        else if (tableName === 'job') {
          const jobRecord = record as unknown as JobRecord;
          recordId = jobRecord.jobcode;
          displayName = `${jobRecord.jobdesc || jobRecord.jobcode} (${jobRecord.jobcode})`;
        } 
        else if (tableName === 'department') {
          const deptRecord = record as unknown as DepartmentRecord;
          recordId = deptRecord.deptcode;
          displayName = `${deptRecord.deptname || deptRecord.deptcode} (${deptRecord.deptcode})`;
        } 
        else if (tableName === 'jobhistory') {
          const jhRecord = record as unknown as JobHistoryRecord;
          recordId = `${jhRecord.empno},${jhRecord.jobcode},${jhRecord.effdate}`;
          displayName = `Employee: ${jhRecord.empno}, Job: ${jhRecord.jobcode}, Date: ${new Date(jhRecord.effdate).toLocaleDateString()}`;
        }
        
        // Use a type assertion to handle the stamp property
        const recordWithStamp = record as { stamp?: string };
        
        return {
          id: recordId,
          displayName: displayName,
          tableName,
          deletedAt: recordWithStamp.stamp || new Date().toISOString()
        };
      });

      setDeletedRecords(formattedRecords);
    } catch (error: any) {
      toast.error(`Error fetching deleted ${tableName} records: ${error.message}`);
      setDeletedRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDeletedRecords(activeTab);
    }
  }, [isAdmin, activeTab]);

  const handleRestore = async (record: DeletedRecord) => {
    try {
      const success = await restoreRecord(record.tableName, record.id);
      
      if (success) {
        setDeletedRecords(prev => prev.filter(r => r.id !== record.id));
      }
    } catch (error: any) {
      toast.error(`Error restoring record: ${error.message}`);
    }
  };

  const handleRefresh = () => {
    fetchDeletedRecords(activeTab);
  };

  // Show admin access only message if not admin
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Key className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Admin Access Required</h2>
          <p className="text-gray-500 mt-2">
            You need admin privileges to access the deleted records page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Deleted Records</h2>
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Deleted Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="employee" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="employee">Employees</TabsTrigger>
                <TabsTrigger value="job">Jobs</TabsTrigger>
                <TabsTrigger value="department">Departments</TabsTrigger>
                <TabsTrigger value="jobhistory">Job History</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="space-y-4">
                {loading ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record</TableHead>
                        <TableHead>Deleted At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletedRecords.length > 0 ? (
                        deletedRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.displayName}</TableCell>
                            <TableCell>
                              {new Date(record.deletedAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(record)}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Restore
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                            No deleted records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
