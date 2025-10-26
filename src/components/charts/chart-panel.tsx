"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, ChartType } from "@/lib/store";
import { BarChart, LineChart, PieChart } from "lucide-react";
import { Separator } from "../ui/separator";

export default function ChartPanel() {
    const { 
        data, 
        columns, 
        columnTypes,
        setActiveView, 
        activeView, 
        chartConfig, 
        setChartConfig 
    } = useStore();
    const hasData = data.length > 0;

    const handleViewChange = (view: 'map' | 'chart') => {
        setActiveView(view);
        if (view === 'map') {
            setChartConfig({ type: null });
        }
    };

    const handleChartTypeChange = (type: ChartType) => {
        if (type === chartConfig.type) {
            // Deselect if clicking the same chart type
             setChartConfig({ type: null });
             setActiveView('map');
        } else {
            setChartConfig({ type, xAxis: null, yAxis: null });
            setActiveView('chart');
        }
    };
    
    const handleAxisChange = (axis: 'xAxis' | 'yAxis') => (value: string) => {
        setChartConfig({ [axis]: value });
    };

    const numericColumns = columns.filter(c => columnTypes[c] === 'number');
    const categoricalColumns = columns.filter(c => columnTypes[c] !== 'number');

    return (
        <div className="space-y-4">
            <div>
                <Label>View</Label>
                 <RadioGroup
                    value={activeView}
                    onValueChange={(val: 'map' | 'chart') => handleViewChange(val)}
                    className="flex mt-2"
                    >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="map" id="map-view" />
                        <Label htmlFor="map-view">Map</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="chart" id="chart-view" disabled={!chartConfig.type} />
                        <Label htmlFor="chart-view">Chart</Label>
                    </div>
                </RadioGroup>
            </div>

            <Separator/>
            
            <div className="space-y-2">
                <Label>Chart Type</Label>
                <p className="text-sm text-muted-foreground">Select a chart to visualize your data.</p>
                <div className="grid grid-cols-3 gap-2 pt-2">
                    <Button
                        variant={chartConfig.type === 'bar' ? 'default' : 'outline'}
                        onClick={() => handleChartTypeChange('bar')}
                        disabled={!hasData}
                        className="flex-col h-16"
                    >
                        <BarChart className="w-6 h-6 mb-1" />
                        <span>Bar</span>
                    </Button>
                    <Button
                        variant={chartConfig.type === 'line' ? 'default' : 'outline'}
                        onClick={() => handleChartTypeChange('line')}
                        disabled={!hasData}
                         className="flex-col h-16"
                    >
                        <LineChart className="w-6 h-6 mb-1" />
                        <span>Line</span>
                    </Button>
                     <Button
                        variant={chartConfig.type === 'pie' ? 'default' : 'outline'}
                        onClick={() => handleChartTypeChange('pie')}
                        disabled={!hasData}
                         className="flex-col h-16"
                    >
                        <PieChart className="w-6 h-6 mb-1" />
                        <span>Pie</span>
                    </Button>
                </div>
            </div>

            {chartConfig.type && (
                <div className="space-y-4 pt-4 border-t">
                     <h3 className="text-sm font-medium text-foreground">
                        Chart Configuration
                    </h3>
                    {chartConfig.type === 'bar' && (
                        <>
                            <div className="space-y-2">
                                <Label>X-Axis (Category)</Label>
                                <Select onValueChange={handleAxisChange('xAxis')} value={chartConfig.xAxis || ""} disabled={!hasData}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoricalColumns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Y-Axis (Value)</Label>
                                <Select onValueChange={handleAxisChange('yAxis')} value={chartConfig.yAxis || ""} disabled={!hasData}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {numericColumns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                     {chartConfig.type === 'line' && (
                        <>
                            <div className="space-y-2">
                                <Label>X-Axis (Category/Time)</Label>
                                <Select onValueChange={handleAxisChange('xAxis')} value={chartConfig.xAxis || ""} disabled={!hasData}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Y-Axis (Value)</Label>
                                <Select onValueChange={handleAxisChange('yAxis')} value={chartConfig.yAxis || ""} disabled={!hasData}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {numericColumns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    {chartConfig.type === 'pie' && (
                        <>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select onValueChange={handleAxisChange('xAxis')} value={chartConfig.xAxis || ""} disabled={!hasData}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoricalColumns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label>Value</Label>
                                <Select onValueChange={handleAxisChange('yAxis')} value={chartConfig.yAxis || ""} disabled={!hasData}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {numericColumns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
