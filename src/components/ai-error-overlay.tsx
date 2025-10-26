"use client";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileCode } from "lucide-react";

export default function AiErrorOverlay() {
    const { aiError, setAiError } = useStore();

    if (!aiError) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="max-w-2xl w-full p-8 m-4 space-y-6 border rounded-lg shadow-2xl bg-card border-destructive">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-destructive/10">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-destructive-foreground font-headline">
                            AI Module Failure
                        </h1>
                        <p className="text-muted-foreground">An error occurred during an AI operation.</p>
                    </div>
                </div>

                <div className="p-4 space-y-2 border rounded-md bg-secondary/30 border-destructive/50">
                    <h2 className="font-semibold text-destructive">Error Details:</h2>
                    <pre className="p-3 text-sm font-code rounded-md bg-background/50 text-destructive whitespace-pre-wrap">
                        {aiError.message}
                    </pre>
                </div>

                <div className="flex items-center gap-3 p-3 text-sm rounded-md bg-muted">
                    <FileCode className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <span className="font-semibold">Source File:</span>
                        <code className="ml-2 font-code">{aiError.sourceFile}</code>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => setAiError(null)}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
