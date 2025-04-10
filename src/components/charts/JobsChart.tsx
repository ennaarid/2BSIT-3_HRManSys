
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type JobData = {
  name: string;
  employees: number;
  avgSalary: number;
};

export const JobsChart = () => {
  const [jobData, setJobData] = useState<JobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all jobs
        const { data: jobs, error: jobError } = await supabase
          .from('job')
          .select('jobcode, jobdesc');
        
        if (jobError) throw jobError;
        
        // Fetch job history to get salary data and employee counts
        const { data: jobHistoryData, error: jobHistoryError } = await supabase
          .from('jobhistory')
          .select('jobcode, empno, salary');
        
        if (jobHistoryError) throw jobHistoryError;
        
        // Process job data
        const jobStats: Record<string, { employees: Set<string>, salaries: number[] }> = {};
        
        jobHistoryData.forEach(record => {
          if (!jobStats[record.jobcode]) {
            jobStats[record.jobcode] = {
              employees: new Set(),
              salaries: [],
            };
          }
          
          jobStats[record.jobcode].employees.add(record.empno);
          if (record.salary) jobStats[record.jobcode].salaries.push(record.salary);
        });
        
        // Create chart data
        const chartData = jobs
          .map(job => {
            const stats = jobStats[job.jobcode] || { employees: new Set(), salaries: [] };
            const avgSalary = stats.salaries.length > 0
              ? stats.salaries.reduce((sum, val) => sum + val, 0) / stats.salaries.length
              : 0;
            
            return {
              name: job.jobdesc || job.jobcode,
              employees: stats.employees.size,
              avgSalary: Math.round(avgSalary),
              jobcode: job.jobcode,
            };
          })
          .filter(job => job.employees > 0) // Only include jobs with employees
          .sort((a, b) => b.employees - a.employees) // Sort by employee count
          .slice(0, 10); // Limit to top 10 jobs
        
        setJobData(chartData);
      } catch (error: any) {
        toast.error('Error fetching job data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  const chartConfig = {
    employees: { color: "#279F49" }, // Green
    avgSalary: { color: "#9b87f5" } // Purple
  };

  return (
    <div className="h-full">
      <ChartContainer config={chartConfig}>
        <BarChart
          data={jobData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            interval={0}
          />
          <YAxis yAxisId="left" orientation="left" stroke="#279F49" />
          <YAxis yAxisId="right" orientation="right" stroke="#9b87f5" />
          <ChartTooltip 
            content={(props) => (
              <ChartTooltipContent {...props} />
            )}
          />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="employees" 
            name="Employees" 
            fill="var(--color-employees)" 
          />
          <Bar 
            yAxisId="right" 
            dataKey="avgSalary" 
            name="Avg. Salary ($)" 
            fill="var(--color-avgSalary)" 
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
