"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Plus, Trash2, ChevronsUpDown } from "lucide-react";
import { useStore, LayerProps } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type LayerType =
  | "ScatterplotLayer"
  | "HeatmapLayer"
  | "HexagonLayer"
  | "ScreenGridLayer"
  | "ColumnLayer";

export default function LayerListPanel() {
  const { addLayer, layers, data, mappedColumns, removeLayer, updateLayerConfig } = useStore();
  const { toast } = useToast();

  const handleAddLayer = (layerType: LayerType) => {
    if (!mappedColumns.latitude || !mappedColumns.longitude) {
      toast({
        variant: "destructive",
        title: "Mapping Incomplete",
        description: "Please select latitude and longitude columns first.",
      });
      return;
    }

    let newLayerConfig: any;
    const id = `${layerType.toLowerCase()}-${Date.now()}`;

    switch (layerType) {
      case "ScatterplotLayer":
        newLayerConfig = {
          opacity: 0.8,
          stroked: true,
          filled: true,
          radiusScale: 6,
          radiusMinPixels: 3,
          radiusMaxPixels: 100,
          lineWidthMinPixels: 1,
          getFillColor: [255, 140, 0, 180],
          getLineColor: [0, 0, 0],
        };
        break;
      case "HeatmapLayer":
        newLayerConfig = {
          opacity: 0.8,
          intensity: 1,
          threshold: 0.03,
          radiusPixels: 30,
        };
        break;
      case "HexagonLayer":
        newLayerConfig = {
          opacity: 0.8,
          extruded: true,
          radius: 2000,
          elevationScale: 4,
        };
        break;
      case "ScreenGridLayer":
        newLayerConfig = {
          opacity: 0.8,
          cellSizePixels: 40,
          colorRange: [
            [0, 25, 0, 25],
            [0, 85, 0, 85],
            [0, 127, 0, 127],
            [0, 170, 0, 170],
            [0, 190, 0, 190],
            [0, 255, 0, 255],
          ],
        };
        break;
      case "ColumnLayer":
        newLayerConfig = {
          opacity: 0.8,
          diskResolution: 12,
          radius: 2500,
          extruded: true,
          getFillColor: [255, 140, 0, 180],
        };
        break;
      default:
        toast({
          variant: "destructive",
          title: "Unknown Layer Type",
          description: "The selected layer type is not supported.",
        });
        return;
    }
    
    const newLayer: LayerProps = {
        id,
        type: layerType,
        config: newLayerConfig
    }

    addLayer(newLayer);
    toast({
      title: "Layer Added",
      description: `A new ${layerType} has been added to the map.`,
    });
  };
  
    const capitalizeFirstLetter = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const handleDeleteLayer = (layerId: string) => {
      removeLayer(layerId);
      toast({
        title: "Layer Removed",
        description: "The layer has been removed from the map."
      })
    }
    
    const handleOpacityChange = (layerId: string, value: number[]) => {
      updateLayerConfig(layerId, { opacity: value[0] });
    }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Separator className="flex-1" />
         <p className="px-2 text-xs text-muted-foreground">MANUAL</p>
        <Separator className="flex-1" />
      </div>
     
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={data.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Layer Manually
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuItem onClick={() => handleAddLayer("ScatterplotLayer")}>
            Scatterplot Layer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddLayer("HeatmapLayer")}>
            Heatmap Layer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddLayer("HexagonLayer")}>
            Hexagon Layer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddLayer("ScreenGridLayer")}>
            Screen Grid Layer
          </DropdownMenuItem>
           <DropdownMenuItem onClick={() => handleAddLayer("ColumnLayer")}>
            Column Layer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Active Layers</h3>
        {layers.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
            No layers added yet.
          </div>
        ) : (
          layers.map((layer, index) => (
            <Collapsible key={layer.id} defaultOpen={true} className="p-3 text-sm border rounded-lg bg-secondary/50">
              <div className="flex items-center justify-between">
                <CollapsibleTrigger className="flex items-center w-full text-left">
                   <ChevronsUpDown className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {capitalizeFirstLetter(layer.type.replace('Layer', ''))} Layer
                  </span>
                  <ChevronDown className="h-4 w-4 ml-auto transition-transform [&[data-state=open]]:rotate-180" />
                </CollapsibleTrigger>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteLayer(layer.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CollapsibleContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                      <Label>Opacity</Label>
                      <Slider
                          value={[layer.config.opacity]}
                          onValueChange={(value) => handleOpacityChange(layer.id, value)}
                          max={1}
                          step={0.01}
                      />
                  </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
}
