
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type GenderDistribution = {
  gender: string;
  count: number;
};

type TenureDistribution = {
  range: string;
  count: number;
};

export const EmployeesChart = () => {
  const [genderData, setGenderData] = useState<GenderDistribution[]>([]);
  const [tenureData, setTenureData] = useState<TenureDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all employees
        const { data: employees, error: empError } = await supabase
          .from('employee')
          .select('gender, hiredate');
        
        if (empError) throw empError;
        
        // Process gender distribution
        const genderCounts: Record<string, number> = {};
        employees.forEach(emp => {
          const gender = emp.gender || 'Unknown';
          genderCounts[gender] = (genderCounts[gender] || 0) + 1;
        });
        
        const genderChartData = Object.entries(genderCounts).map(([gender, count]) => ({
          gender: gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Unknown',
          count,
        }));
        
        // Process tenure distribution
        const now = new Date();
        const tenureCounts: Record<string, number> = {
          '< 1 year': 0,
          '1-3 years': 0,
          '3-5 years': 0,
          '5+ years': 0,
        };
        
        employees.forEach(emp => {
          if (!emp.hiredate) return;
          
          const hireDate = new Date(emp.hiredate);
          const tenureYears = (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          
          if (tenureYears < 1) tenureCounts['< 1 year'] += 1;
          else if (tenureYears < 3) tenureCounts['1-3 years'] += 1;
          else if (tenureYears < 5) tenureCounts['3-5 years'] += 1;
          else tenureCounts['5+ years'] += 1;
        });
        
        const tenureChartData = Object.entries(tenureCounts).map(([range, count]) => ({
          range,
          count,
        }));
        
        setGenderData(genderChartData);
        setTenureData(tenureChartData);
      } catch (error: any) {
        toast.error('Error fetching employee data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  const chartConfig = {
    gender: {
      Male: { color: "#279F49" }, // Green
      Female: { color: "#9b87f5" }, // Purple
      Unknown: { color: "#8E9196" } // Gray
    },
    tenure: {
      "< 1 year": { color: "#D3E4FD" },
      "1-3 years": { color: "#90CAF9" },
      "3-5 years": { color: "#42A5F5" },
      "5+ years": { color: "#279F49" }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Gender Distribution</h3>
        <div className="h-[320px]">
          <ChartContainer config={chartConfig.gender}>
            <BarChart data={genderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="gender" />
              <YAxis />
              <ChartTooltip 
                content={(props) => (
                  <ChartTooltipContent 
                    {...props} 
                    formatter={(value, name) => [`${value} employees`, name]}
                  />
                )}
              />
              <Bar dataKey="count" name="Employees" fill="var(--color-Male)" />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Tenure Distribution</h3>
        <div className="h-[320px]">
          <ChartContainer config={chartConfig.tenure}>
            <BarChart data={tenureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <ChartTooltip 
                content={(props) => (
                  <ChartTooltipContent 
                    {...props} 
                    formatter={(value, name) => [`${value} employees`, name]}
                  />
                )}
              />
              <Bar dataKey="count" name="Employees" fill="var(--color-5+ years)" />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};
