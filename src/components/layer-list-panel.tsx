import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useStore, DataRecord } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ScatterplotLayer } from "@deck.gl/layers";
import { Layer } from "@deck.gl/core";
import { useEffect, useState } from "react";

export default function LayerListPanel() {
    const { addLayer, layers, data, mappedColumns } = useStore();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);


    const handleAddLayer = () => {
        if (!mappedColumns.latitude || !mappedColumns.longitude) {
            toast({
                variant: 'destructive',
                title: "Mapping Incomplete",
                description: "Please select latitude and longitude columns first.",
            });
            return;
        }

        const newLayer = new ScatterplotLayer({
            id: `scatterplot-${Date.now()}`,
            data,
            pickable: true,
            opacity: 0.8,
            stroked: true,
            filled: true,
            radiusScale: 6,
            radiusMinPixels: 3,
            radiusMaxPixels: 100,
            lineWidthMinPixels: 1,
            getPosition: (d: DataRecord) => [Number(d[mappedColumns.longitude!]), Number(d[mappedColumns.latitude!])],
            getFillColor: [255, 140, 0],
            getLineColor: [0, 0, 0],
        });

        addLayer(newLayer);
        toast({
            title: "Layer Added",
            description: "A new Scatterplot layer has been added to the map.",
        });
    };

    if (!isClient) {
        return null;
    }


    return (
        <div className="space-y-4">
             <p className="text-sm text-muted-foreground">
                Add and configure your visualization layers.
            </p>
            <Button variant="outline" className="w-full" onClick={handleAddLayer} disabled={data.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Scatterplot Layer
            </Button>
            
            <div className="space-y-2">
                {layers.length === 0 ? (
                     <div className="flex items-center justify-center h-24 text-sm border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                        No layers added yet.
                    </div>
                ) : (
                    layers.map((layer, index) => (
                        <div key={layer.id} className="p-3 text-sm border rounded-lg bg-secondary/50">
                            <div className="font-medium">
                                Layer {index + 1}: {layer.id.split('-')[0]}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
