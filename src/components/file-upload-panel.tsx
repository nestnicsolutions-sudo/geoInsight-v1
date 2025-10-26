"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, Loader2 } from "lucide-react";
import { useState, useCallback, ChangeEvent, DragEvent } from "react";
import { useStore } from "@/lib/store";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { suggestColumnMapping } from "@/ai/flows/suggest-column-mapping";

export default function FileUploadPanel() {
    const [dragging, setDragging] = useState(false);
    const [loadingSample, setLoadingSample] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const { rawData, setRawData, setData, setColumns, setMappedColumns } = useStore();

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

    const processFile = async (file: File) => {
        setIsProcessing(true);
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const content = e.target?.result;
                if (!content) throw new Error("File content is empty.");

                let parsedData: any[] = [];
                let fileContentStr = "";

                if (file.name.endsWith('.csv')) {
                    fileContentStr = content as string;
                    const result = Papa.parse(fileContentStr, { header: true, skipEmptyLines: true });
                    parsedData = result.data;
                } else if (file.name.endsWith('.xlsx')) {
                    const workbook = XLSX.read(content, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    parsedData = XLSX.utils.sheet_to_json(worksheet);
                    fileContentStr = JSON.stringify(parsedData, null, 2);
                } else if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
                    fileContentStr = content as string;
                    const jsonData = JSON.parse(fileContentStr);
                    if (jsonData.type === 'FeatureCollection') {
                        parsedData = jsonData.features.map((feature: any) => ({
                            ...feature.properties,
                            geometry: feature.geometry
                        }));
                    } else {
                        parsedData = Array.isArray(jsonData) ? jsonData : [jsonData];
                    }
                } else {
                    throw new Error("Unsupported file type. Please use CSV, XLSX, or GeoJSON.");
                }

                if (parsedData.length > 0) {
                    const columns = Object.keys(parsedData[0]);
                    setData(parsedData);
                    setColumns(columns);
                    setRawData({ name: file.name, content: fileContentStr });
                    toast({
                        title: "File Processed Successfully",
                        description: `Now analyzing data for smart mapping...`,
                    });

                    // AI-powered column mapping
                    try {
                        const dataPreview = JSON.stringify(parsedData.slice(0, 50));
                        const suggestions = await suggestColumnMapping({ columnNames: columns, dataPreview });
                        
                        const validSuggestions = Object.entries(suggestions).reduce((acc, [key, value]) => {
                            if (value && columns.includes(value)) {
                                acc[key as keyof typeof suggestions] = value;
                            }
                            return acc;
                        }, {} as Partial<typeof suggestions>);

                        setMappedColumns(validSuggestions);

                        toast({
                            title: "AI Mapping Complete",
                            description: "Columns have been automatically mapped. Please review.",
                        });
                    } catch (aiError: any) {
                         toast({
                            variant: 'destructive',
                            title: "AI Mapping Failed",
                            description: aiError.message || "Could not suggest column mappings.",
                        });
                    }

                } else {
                    throw new Error("No data found in the file.");
                }

            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: "Failed to process file",
                    description: error.message || "An unknown error occurred.",
                });
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
            const text = await response.text();
            await processFile(new File([text], 'sample-data.csv', { type: 'text/csv' }));
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Failed to load sample data",
                description: "Please check your network connection and try again.",
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
