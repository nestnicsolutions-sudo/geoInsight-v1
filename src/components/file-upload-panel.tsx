"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, Loader2 } from "lucide-react";
import { useState, useCallback, ChangeEvent, DragEvent } from "react";
import { useStore } from "@/lib/store";

export default function FileUploadPanel() {
    const [dragging, setDragging] = useState(false);
    const [loadingSample, setLoadingSample] = useState(false);
    const { toast } = useToast();
    const { rawData, setRawData } = useStore();

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

    const processFile = (file: File) => {
        // Placeholder for file processing logic
        console.log("Processing file:", file.name);
        setRawData({ name: file.name, content: "dummy content" });
        toast({
            title: "File Uploaded",
            description: `${file.name} is ready for column mapping.`,
        });
    };
    
    const loadSampleData = async () => {
        setLoadingSample(true);
        try {
            const response = await fetch('/sample-data.csv');
            const text = await response.text();
            // In a real app, you would parse this text
            setRawData({ name: 'sample-data.csv', content: text });
            toast({
                title: "Sample Data Loaded",
                description: "The sample dataset is ready for column mapping.",
            });
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

    return (
        <div className="space-y-4">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${dragging ? 'border-primary bg-muted/50' : 'border-border'}`}
            >
                <UploadCloud className="w-10 h-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-center text-muted-foreground">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">CSV, XLSX, or JSON (max 10MB)</p>
                <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept=".csv,.xlsx,.json" />
            </div>
            <div className="relative flex items-center">
                <div className="flex-grow border-t border-muted-foreground/20"></div>
                <span className="flex-shrink mx-4 text-xs text-muted-foreground">OR</span>
                <div className="flex-grow border-t border-muted-foreground/20"></div>
            </div>
            <Button variant="outline" className="w-full" onClick={loadSampleData} disabled={loadingSample}>
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
