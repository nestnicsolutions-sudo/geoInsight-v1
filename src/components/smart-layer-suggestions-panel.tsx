"use client";

import { useStore, LayerProps } from "@/lib/store";
import { useEffect, useState } from "react";
import { suggestLayers, SmartLayerSuggestionsOutput } from "@/ai/flows/smart-layer-suggestions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

export default function SmartLayerSuggestionsPanel() {
    const { 
        mappedColumns, 
        columns: columnNames,
        columnTypes, 
        layerSuggestions, 
        setLayerSuggestions, 
        addLayer,
        layers,
        setAiError,
        rawData
    } = useStore();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const hasLatLng = mappedColumns.latitude && mappedColumns.longitude;

    const fetchSuggestions = async () => {
        if (!hasLatLng || !rawData?.content) return;

        setLoading(true);
        setLayerSuggestions([]); // Clear previous suggestions
        setAiError(null); // Clear previous errors
        try {
            const suggestions = await suggestLayers({
                dataSample: rawData.content,
                columnTypes,
                columnNames,
                mappedLatitude: mappedColumns.latitude,
                mappedLongitude: mappedColumns.longitude,
                mappedValue: mappedColumns.value,
                mappedCategory: mappedColumns.category,
            });
            setLayerSuggestions(suggestions);
        } catch (error: any) {
             setAiError({
                message: error.message || "Could not generate layer suggestions.",
                sourceFile: "src/ai/flows/smart-layer-suggestions.ts"
            });
            // Ensure suggestions are cleared on failure
            setLayerSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Effect to automatically fetch suggestions when mappings change
    useEffect(() => {
        if (hasLatLng && rawData?.content) {
            const timer = setTimeout(() => {
                fetchSuggestions();
            }, 500); // Debounce to avoid rapid calls
            return () => clearTimeout(timer);
        } else {
            // Clear suggestions if lat/lng are unmapped
            setLayerSuggestions([]);
        }
    }, [hasLatLng, mappedColumns.value, mappedColumns.category, columnNames, columnTypes, rawData]);


    const handleAddLayer = (suggestion: SmartLayerSuggestionsOutput[0]) => {
        const newLayer: LayerProps = {
            id: `${suggestion.layerType.toLowerCase()}-${Date.now()}`,
            type: suggestion.layerType,
            config: suggestion.initialConfiguration,
        };
        addLayer(newLayer);
        toast({
            title: "Layer Added",
            description: `The suggested ${suggestion.layerType} has been added.`,
        });
    };
    
    if (!hasLatLng) {
        return (
             <div className="py-4 text-sm text-center text-muted-foreground">
                Map your latitude and longitude columns to get AI-powered layer suggestions.
            </div>
        );
    }
    
    const availableSuggestions = layerSuggestions.filter(suggestion => 
      !layers.some(l => l.type === suggestion.layerType)
    );

    return (
        <div className="space-y-4 mb-4">
             <div className="flex items-center">
                <Separator className="flex-1" />
                <p className="px-2 text-xs uppercase text-muted-foreground">AI Suggestions</p>
                <Separator className="flex-1" />
            </div>

            {loading && (
                <div className="flex items-center justify-center h-24 text-sm border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin text-primary" />
                    <span className="text-primary">Generating smart suggestions...</span>
                </div>
            )}

            {!loading && availableSuggestions.length > 0 && (
                 <div className="grid gap-3">
                    {availableSuggestions.map((suggestion, index) => {
                        return (
                            <Card key={index} className="bg-background/50">
                                <CardHeader className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                                        <CardTitle className="text-base">{suggestion.layerType.replace('Layer', ' Layer')}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                     <CardDescription>{suggestion.rationale}</CardDescription>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Button size="sm" className="w-full" onClick={() => handleAddLayer(suggestion)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Layer
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
            
            {!loading && layerSuggestions.length > 0 && availableSuggestions.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-24 p-4 text-sm text-center border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                    <span>All AI suggestions have been added to the map.</span>
                </div>
            )}

            {!loading && layerSuggestions.length === 0 && hasLatLng && (
                <div className="flex flex-col items-center justify-center h-24 p-4 text-sm text-center border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                    <span>The AI couldn't find any specific layer suggestions for this data.</span>
                     <Button variant="link" size="sm" onClick={fetchSuggestions}>Try regenerating</Button>
                </div>
            )}
        </div>
    )
}
