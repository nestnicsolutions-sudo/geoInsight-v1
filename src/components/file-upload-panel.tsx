"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, Loader2 } from "lucide-react";
import { useState, useCallback, ChangeEvent, DragEvent } from "react";
import { useStore } from "@/lib/store";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export default function FileUploadPanel() {
    const [dragging, setDragging] = useState(false);
    const [loadingSample, setLoadingSample] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const { rawData, setRawData, setData, setColumns, setColumnTypes, setMappedColumns, setAiError, layers, setLayerSuggestions } = useStore();

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            processFile(file);
        }
    };

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    }, []);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

     const inferColumnTypes = (data: any[]) => {
        if (data.length === 0) return {};
        const firstRow = data[0];
        const types: Record<string, string> = {};
        for (const col in firstRow) {
            const value = firstRow[col];
            if (typeof value === 'number') {
                types[col] = 'number';
            } else if (typeof value === 'boolean') {
                types[col] = 'boolean';
            } else if (typeof value === 'string') {
                types[col] = 'string';
            } else if (value instanceof Date) {
                types[col] = 'date';
            } else {
                 // Try to parse to number for CSVs
                if (!isNaN(Number(value))) {
                     types[col] = 'number';
                } else {
                    types[col] = 'string';
                }
            }
        }
        return types;
    }

    const suggestColumns = (columns: string[]) => {
        toast({
            title: "Column Analysis",
            description: "Analyzing columns to find latitude and longitude...",
        });

        const latKeywords = ['lat', 'latitude', 'y', 'lat_num', 'latitude_decimal'];
        const lonKeywords = ['lon', 'lng', 'long', 'longitude', 'x', 'long_num', 'longitude_decimal'];

        let latitude: string | null = null;
        let longitude: string | null = null;

        for (const col of columns) {
            const lowerCol = col.toLowerCase();
            if (!latitude && latKeywords.some(keyword => lowerCol.includes(keyword))) {
                latitude = col;
            }
            if (!longitude && lonKeywords.some(keyword => lowerCol.includes(keyword))) {
                longitude = col;
            }
            if (latitude && longitude) break;
        }

        if (latitude && longitude) {
            setMappedColumns({ latitude, longitude });
            toast({
                title: "Automatic Mapping Successful",
                description: `Latitude and Longitude columns have been automatically mapped.`,
            });
        } else {
             toast({
                variant: 'default',
                title: "Automatic Mapping",
                description: "Could not automatically determine latitude and longitude columns. Please map them manually.",
            });
        }
    }


    const processFile = (file: File) => {
        setIsProcessing(true);
        // Reset everything
        setData([]);
        setColumns([]);
        setColumnTypes({});
        setMappedColumns({ latitude: null, longitude: null, value: null, category: null });
        setLayerSuggestions([]);
        setAiError(null);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (!content) throw new Error("File content is empty.");

                let parsedData: any[] = [];
                let fileContentStr = "";

                if (file.name.endsWith('.csv')) {
                    fileContentStr = content as string;
                    const result = Papa.parse(fileContentStr, { header: true, skipEmptyLines: true, dynamicTyping: true });
                    parsedData = result.data as any[];
                } else if (file.name.endsWith('.xlsx')) {
                    const workbook = XLSX.read(content, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    parsedData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // Use defval to handle empty cells
                    fileContentStr = JSON.stringify(parsedData.slice(0, 50), null, 2);
                } else if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
                    fileContentStr = content as string;
                    const jsonData = JSON.parse(fileContentStr);
                    if (jsonData.type === 'FeatureCollection') {
                        // Handle GeoJSON FeatureCollection
                        parsedData = jsonData.features.map((feature: any) => ({
                            ...feature.properties,
                            geometry: feature.geometry // Keep geometry for potential future use (e.g. polygons)
                        }));
                    } else {
                        // Handle regular JSON array or single object
                        parsedData = Array.isArray(jsonData) ? jsonData : [jsonData];
                    }
                } else {
                    throw new Error("Unsupported file type. Please use CSV, XLSX, or GeoJSON.");
                }

                if (parsedData.length > 0) {
                    const columns = Object.keys(parsedData[0]);
                    const columnTypes = inferColumnTypes(parsedData);
                    
                    setData(parsedData);
                    setColumns(columns);
                    setColumnTypes(columnTypes);
                    setRawData({ name: file.name, content: fileContentStr.substring(0, 5000) });
                    
                    toast({
                        title: "File Processed Successfully",
                        description: `Found ${parsedData.length} rows and ${columns.length} columns.`,
                    });
                    
                    suggestColumns(columns);

                } else {
                    throw new Error("No data found in the file.");
                }

            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: "Failed to process file",
                    description: error.message || "An unknown error occurred.",
                });
                // Reset state on failure
                setRawData(null);
                setData([]);
                setColumns([]);
            } finally {
                setIsProcessing(false);
            }
        };

        reader.onerror = () => {
             toast({
                variant: 'destructive',
                title: "Failed to read file",
                description: "Could not read the selected file.",
            });
             setIsProcessing(false);
        }
        
        if (file.name.endsWith('.xlsx')) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    };
    
    const loadSampleData = async () => {
        setLoadingSample(true);
        try {
            const response = await fetch('/sample-data.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            const file = new File([text], 'sample-data.csv', { type: 'text/csv' });
            processFile(file);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Failed to load sample data",
                description: error.message || "Please check your network connection and try again.",
            });
        } finally {
            setLoadingSample(false);
        }
    }

    const isBusy = isProcessing || loadingSample;

    return (
        <div className="space-y-4">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${dragging ? 'border-primary bg-muted/50' : 'border-border'} ${isBusy ? 'pointer-events-none opacity-50' : ''}`}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="mt-2 text-sm text-center text-muted-foreground">Processing...</p>
                    </>
                ) : (
                    <>
                        <UploadCloud className="w-10 h-10 text-muted-foreground" />
                        <p className="mt-2 text-sm text-center text-muted-foreground">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">CSV, XLSX, or GeoJSON</p>
                        <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept=".csv,.xlsx,.json,.geojson" disabled={isBusy} />
                    </>
                )}
            </div>
            <div className="relative flex items-center">
                <div className="flex-grow border-t border-muted-foreground/20"></div>
                <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR</span>
                <div className="flex-grow border-t border-muted-foreground/20"></div>
            </div>
            <Button variant="outline" className="w-full" onClick={loadSampleData} disabled={isBusy}>
                {loadingSample ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <File className="mr-2 h-4 w-4" />
                )}
                Load Sample Data
            </Button>

            {rawData && (
                <div className="p-3 text-sm border rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 font-medium">
                        <File className="w-4 h-4 text-primary" />
                        <span>{rawData.name}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
