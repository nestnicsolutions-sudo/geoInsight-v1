"use client";

import { useStore } from "@/lib/store";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "../ui/skeleton";

export default function ChartContainer() {
  const { data, chartConfig } = useStore();

  const chartData = useMemo(() => {
    if (!chartConfig.type || !chartConfig.xAxis || !chartConfig.yAxis || data.length === 0) {
      return null;
    }

    if (chartConfig.type === 'pie' || chartConfig.type === 'bar') {
       const aggregated: { [key: string]: number } = {};
       data.forEach(item => {
           const category = item[chartConfig.xAxis!];
           const value = Number(item[chartConfig.yAxis!]);
           if (category && !isNaN(value)) {
               if (!aggregated[category]) {
                   aggregated[category] = 0;
               }
               aggregated[category] += value;
           }
       });

       return Object.keys(aggregated).map(key => ({
           name: key,
           value: aggregated[key]
       }));
    }

    return data;
  }, [data, chartConfig]);

  const renderChart = () => {
    if (!chartConfig.type || !chartData || !chartConfig.xAxis || !chartConfig.yAxis) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <p className="text-lg font-medium">No chart configured</p>
          <p className="text-sm">Please select a chart type and map the columns in the control panel.</p>
        </div>
      );
    }
    
    const chartNameKey = chartConfig.type === 'pie' || chartConfig.type === 'bar' ? 'name' : chartConfig.xAxis;
    const chartValueKey = chartConfig.type === 'pie' || chartConfig.type === 'bar' ? 'value' : chartConfig.yAxis;

    return (
      <ResponsiveContainer width="100%" height="100%">
        {
          {
            bar: (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartNameKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={chartValueKey} fill="hsl(var(--primary))" />
              </BarChart>
            ),
            line: (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartConfig.xAxis} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={chartConfig.yAxis} stroke="hsl(var(--primary))" />
              </LineChart>
            ),
            pie: (
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="hsl(var(--primary))" label>
                  {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ),
          }[chartConfig.type]
        }
      </ResponsiveContainer>
    );
  };
  
  if (!data || data.length === 0) {
      return <Skeleton className="w-full h-full" />
  }

  return <div className="w-full h-full p-4">{renderChart()}</div>;
}
