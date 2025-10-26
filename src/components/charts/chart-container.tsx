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
  ScatterChart,
  Scatter,
} from "recharts";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";

export default function ChartContainer() {
  const { data, chartConfig } = useStore();

  const chartData = useMemo(() => {
    if (!chartConfig.type || !chartConfig.xAxis || data.length === 0) {
      // yAxis is not required for histogram or summary
      if (chartConfig.type !== 'histogram' && chartConfig.type !== 'summary' && !chartConfig.yAxis) {
          return null;
      }
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

    if (chartConfig.type === 'histogram') {
        const values = data.map(item => Number(item[chartConfig.xAxis!])).filter(v => !isNaN(v));
        const min = Math.min(...values);
        const max = Math.max(...values);
        const bins = 10;
        const binWidth = (max - min) / bins;
        
        const histogramData = Array(bins).fill(0).map((_, i) => {
            const binStart = min + i * binWidth;
            const binEnd = binStart + binWidth;
            return {
                name: `${binStart.toFixed(2)}-${binEnd.toFixed(2)}`,
                count: 0
            };
        });

        values.forEach(value => {
            let binIndex = Math.floor((value - min) / binWidth);
            // handle edge case where value is exactly max
            if (binIndex === bins) binIndex = bins - 1;
            if (histogramData[binIndex]) {
                 histogramData[binIndex].count++;
            }
        });
        return histogramData;
    }


    return data;
  }, [data, chartConfig]);

  const summaryStats = useMemo(() => {
    if (chartConfig.type !== 'summary' || !chartConfig.xAxis || data.length === 0) return null;
    
    const values = data.map(d => Number(d[chartConfig.xAxis!])).filter(v => !isNaN(v));
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const sorted = values.sort((a, b) => a - b);
    const median = count % 2 === 0 ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2 : sorted[Math.floor(count / 2)];
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
        'Count': count,
        'Sum': sum.toLocaleString(),
        'Mean': mean.toLocaleString(),
        'Median': median.toLocaleString(),
        'Minimum': min.toLocaleString(),
        'Maximum': max.toLocaleString(),
    };
  }, [data, chartConfig]);

  const renderChart = () => {
    if (!chartConfig.type || (!chartData && chartConfig.type !== 'summary') || !chartConfig.xAxis) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <p className="text-lg font-medium">No chart configured</p>
          <p className="text-sm">Please select a chart type and map the columns in the control panel.</p>
        </div>
      );
    }
    
    const chartNameKey = (chartConfig.type === 'pie' || chartConfig.type === 'bar' || chartConfig.type === 'histogram') ? 'name' : chartConfig.xAxis;
    const chartValueKey = (chartConfig.type === 'pie' || chartConfig.type === 'bar') ? 'value' : chartConfig.yAxis;

    if (chartConfig.type === 'summary') {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Summary for: {chartConfig.xAxis}</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {summaryStats && (
                           <Table>
                               <TableBody>
                                   {Object.entries(summaryStats).map(([key, value]) => (
                                       <TableRow key={key}>
                                           <TableCell className="font-medium">{key}</TableCell>
                                           <TableCell className="text-right">{value}</TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                       )}
                    </CardContent>
                </Card>
            </div>
        )
    }

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
                <Bar dataKey={chartValueKey!} fill="hsl(var(--primary))" />
              </BarChart>
            ),
            line: (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartConfig.xAxis} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={chartConfig.yAxis!} stroke="hsl(var(--primary))" />
              </LineChart>
            ),
            pie: (
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="hsl(var(--primary))" label>
                  {chartData!.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ),
            histogram: (
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
            ),
            scatter: (
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey={chartConfig.xAxis!} name={chartConfig.xAxis!} />
                    <YAxis type="number" dataKey={chartConfig.yAxis!} name={chartConfig.yAxis!} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Data Points" data={data} fill="hsl(var(--primary))" />
                </ScatterChart>
            ),
            summary: null,
          }[chartConfig.type!]
        }
      </ResponsiveContainer>
    );
  };
  
  if (!data || data.length === 0) {
      return <Skeleton className="w-full h-full" />
  }

  return <div className="w-full h-full p-4">{renderChart()}</div>;
}
