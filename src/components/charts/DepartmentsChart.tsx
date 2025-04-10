
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type DepartmentData = {
  name: string;
  value: number;
};

export const DepartmentsChart = () => {
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch departments
        const { data: departments, error: deptError } = await supabase
          .from('department')
          .select('deptcode, deptname');
        
        if (deptError) throw deptError;
        
        // Fetch job history to count employees per department
        const { data: jobHistoryData, error: jobHistoryError } = await supabase
          .from('jobhistory')
          .select('deptcode, empno');
        
        if (jobHistoryError) throw jobHistoryError;
        
        // Count unique employees per department
        const departmentEmployees: Record<string, Set<string>> = {};
        jobHistoryData.forEach(record => {
          if (!record.deptcode) return;
          
          if (!departmentEmployees[record.deptcode]) {
            departmentEmployees[record.deptcode] = new Set();
          }
          departmentEmployees[record.deptcode].add(record.empno);
        });
        
        // Create chart data
        const chartData = departments.map(dept => {
          const employeeSet = departmentEmployees[dept.deptcode] || new Set();
          return {
            name: dept.deptname || dept.deptcode,
            value: employeeSet.size,
            deptcode: dept.deptcode,
          };
        })
        .filter(dept => dept.value > 0) // Only include departments with employees
        .sort((a, b) => b.value - a.value); // Sort by employee count descending
        
        setDepartmentData(chartData);
      } catch (error: any) {
        toast.error('Error fetching department data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  // Define colors for the pie chart
  const COLORS = ['#279F49', '#8E9196', '#9b87f5', '#F97316', '#0EA5E9', '#D946EF', '#1EAEDB'];

  const pieConfig = departmentData.reduce((config, dept, index) => {
    const colorIndex = index % COLORS.length;
    return {
      ...config,
      [dept.name]: { color: COLORS[colorIndex] }
    };
  }, {});

  // Custom tooltip formatter function
  const formatTooltip = (value: number, name: string) => {
    return [`${value} employees`, name];
  };

  return (
    <div className="h-full">
      <ChartContainer config={pieConfig} className="h-full">
        <PieChart>
          <Pie
            data={departmentData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {departmentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            content={(props) => {
              return <ChartTooltipContent {...props} formatter={formatTooltip} />;
            }}
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
};
