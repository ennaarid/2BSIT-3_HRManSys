
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import EmployeeLayout from '@/components/Layout/EmployeeLayout';

interface EmployeeData {
  empno: string;
  firstname: string;
  lastname: string;
  birthdate: string | null;
  hiredate: string | null;
  gender: string | null;
}

interface JobHistoryData {
  empno: string;
  jobcode: string;
  deptcode: string | null;
  effdate: string;
  salary: number | null;
  job?: {
    jobdesc: string | null;
  };
  department?: {
    deptname: string | null;
  };
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [jobHistory, setJobHistory] = useState<JobHistoryData[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Fetch the user profile to get permissions
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        setUserProfile(profileData);
        
        // Get the employee record associated with this user's email
        const { data: employeeData, error: employeeError } = await supabase
          .from('employee')
          .select('*')
          .eq('email', user.email)
          .neq('status', 'DELETED')
          .single();
          
        if (employeeError && employeeError.code !== 'PGRST116') {
          throw employeeError;
        }
        
        if (employeeData) {
          setEmployeeData(employeeData);
          
          // Fetch job history for this employee
          const { data: jobHistoryData, error: jobHistoryError } = await supabase
            .from('jobhistory')
            .select(`
              *,
              job:jobcode (
                jobdesc
              ),
              department:deptcode (
                deptname
              )
            `)
            .eq('empno', employeeData.empno)
            .neq('status', 'DELETED')
            .order('effdate', { ascending: false });
            
          if (jobHistoryError) throw jobHistoryError;
          setJobHistory(jobHistoryData || []);
        }
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast.error(error.message || 'Failed to load your information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </EmployeeLayout>
    );
  }

  if (!employeeData) {
    return (
      <EmployeeLayout>
        <div className="max-w-3xl mx-auto mt-8 p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Welcome to Employee Dashboard</CardTitle>
              <CardDescription>
                Your employee record was not found in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please contact the HR department to set up your employee profile.</p>
            </CardContent>
          </Card>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="max-w-6xl mx-auto mt-8 p-4 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your employee profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Employee Number</h3>
                <p className="text-base">{employeeData.empno}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="text-base">{`${employeeData.firstname || ''} ${employeeData.lastname || ''}`}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                <p className="text-base">{employeeData.gender || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Birth Date</h3>
                <p className="text-base">
                  {employeeData.birthdate 
                    ? new Date(employeeData.birthdate).toLocaleDateString() 
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Hire Date</h3>
                <p className="text-base">
                  {employeeData.hiredate 
                    ? new Date(employeeData.hiredate).toLocaleDateString() 
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job History</CardTitle>
            <CardDescription>Your employment history at Celadon Peak</CardDescription>
          </CardHeader>
          <CardContent>
            {jobHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Effective Date</th>
                      <th className="text-left py-2">Job</th>
                      <th className="text-left py-2">Department</th>
                      <th className="text-left py-2">Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobHistory.map((job, index) => (
                      <tr key={`${job.empno}-${job.effdate}-${index}`} className="border-b">
                        <td className="py-2">
                          {new Date(job.effdate).toLocaleDateString()}
                        </td>
                        <td className="py-2">{job.job?.jobdesc || job.jobcode}</td>
                        <td className="py-2">{job.department?.deptname || job.deptcode || 'N/A'}</td>
                        <td className="py-2">
                          {job.salary ? `$${job.salary.toLocaleString()}` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No job history records found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
