
"use client";

import { useStore, LayerProps } from "@/lib/store";
import { useEffect, useState } from "react";
import { suggestLayers, SmartLayerSuggestionsOutput } from "@/ai/flows/smart-layer-suggestions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wand2, Lightbulb, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";

export default function SmartLayerSuggestionsPanel() {
    const { 
        mappedColumns, 
        columnNames, 
        columnTypes, 
        layerSuggestions, 
        setLayerSuggestions, 
        addLayer,
        layers
    } = useStore();
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const hasLatLng = mappedColumns.latitude && mappedColumns.longitude;

    const fetchSuggestions = async () => {
        if (!hasLatLng) return;

        setLoading(true);
        setLayerSuggestions([]);
        try {
            const suggestions = await suggestLayers({
                columnTypes,
                columnNames,
                mappedLatitude: mappedColumns.latitude,
                mappedLongitude: mappedColumns.longitude,
                mappedValue: mappedColumns.value,
                mappedCategory: mappedColumns.category,
            });
            setLayerSuggestions(suggestions);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "AI Suggestion Failed",
                description: error.message || "Could not generate layer suggestions.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Automatically fetch suggestions when mappings change, but only if lat/lng are set
        if (hasLatLng) {
            fetchSuggestions();
        } else {
            // Clear suggestions if mappings become invalid
            setLayerSuggestions([]);
        }
    }, [mappedColumns.latitude, mappedColumns.longitude, mappedColumns.value, mappedColumns.category]);


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
             <div className="text-sm text-center text-muted-foreground py-4">
                Map your latitude and longitude columns to get AI-powered layer suggestions.
            </div>
        );
    }

    return (
        <div className="space-y-4 mb-4">
             <div className="flex items-center">
                <Separator className="flex-1" />
                <p className="px-2 text-xs text-muted-foreground">AI SUGGESTIONS</p>
                <Separator className="flex-1" />
            </div>

            {loading && (
                <div className="flex items-center justify-center h-24 text-sm border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                    <Loader2 className="w-6 h-6 mr-2 animate-spin text-primary" />
                    <span className="text-primary">Generating smart suggestions...</span>
                </div>
            )}

            {!loading && layerSuggestions.length > 0 && (
                 <div className="grid gap-3">
                    {layerSuggestions.map((suggestion, index) => {
                        const isAlreadyAdded = layers.some(l => l.type === suggestion.layerType);
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
                                    <Button size="sm" className="w-full" onClick={() => handleAddLayer(suggestion)} disabled={isAlreadyAdded}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        {isAlreadyAdded ? "Layer Added" : "Add Layer"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
            
            {!loading && layerSuggestions.length === 0 && hasLatLng && (
                <div className="flex flex-col items-center justify-center h-24 text-sm border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                    <span>No suggestions available.</span>
                     <Button variant="link" size="sm" onClick={fetchSuggestions}>Try regenerating</Button>
                </div>
            )}
        </div>
    )
}
