
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type SalaryTrend = {
  date: string;
  avgSalary: number;
  employeeCount: number;
};

export const SalaryTrendsChart = () => {
  const [salaryData, setSalaryData] = useState<SalaryTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalaryTrends = async () => {
      try {
        setIsLoading(true);
        
        // Fetch job history with salary data
        const { data: jobHistoryData, error: historyError } = await supabase
          .from('jobhistory')
          .select('effdate, salary, empno')
          .order('effdate', { ascending: true });
        
        if (historyError) throw historyError;
        
        // Group data by year
        const yearlyData: Record<string, { salaries: number[], employees: Set<string> }> = {};
        
        jobHistoryData.forEach(record => {
          if (!record.effdate || !record.salary) return;
          
          const year = new Date(record.effdate).getFullYear().toString();
          
          if (!yearlyData[year]) {
            yearlyData[year] = {
              salaries: [],
              employees: new Set()
            };
          }
          
          yearlyData[year].salaries.push(record.salary);
          yearlyData[year].employees.add(record.empno);
        });
        
        // Create chart data
        const chartData = Object.entries(yearlyData)
          .map(([year, data]) => {
            const avgSalary = data.salaries.length > 0
              ? data.salaries.reduce((sum, val) => sum + val, 0) / data.salaries.length
              : 0;
            
            return {
              date: year,
              avgSalary: Math.round(avgSalary),
              employeeCount: data.employees.size
            };
          })
          .sort((a, b) => parseInt(a.date) - parseInt(b.date)); // Sort by year
        
        setSalaryData(chartData);
      } catch (error: any) {
        toast.error('Error fetching salary trend data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalaryTrends();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  const chartConfig = {
    avgSalary: { color: "#279F49" }, // Green
    employeeCount: { color: "#9b87f5" } // Purple
  };

  // Custom tooltip component to use with recharts
  const CustomTooltip = (props: any) => {
    if (!props.active || !props.payload) return null;
    return <ChartTooltipContent {...props} />;
  };

  return (
    <div className="h-full">
      <ChartContainer config={chartConfig}>
        <LineChart
          data={salaryData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" orientation="left" stroke="#279F49" />
          <YAxis yAxisId="right" orientation="right" stroke="#9b87f5" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="avgSalary" 
            name="Avg. Salary ($)" 
            stroke="var(--color-avgSalary)" 
            activeDot={{ r: 8 }} 
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="employeeCount" 
            name="Employee Count" 
            stroke="var(--color-employeeCount)" 
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};
