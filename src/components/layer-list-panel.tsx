
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
import SmartLayerSuggestionsPanel from "./smart-layer-suggestions-panel";
import { cn } from "@/lib/utils";

type LayerType =
  | "ScatterplotLayer"
  | "HeatmapLayer"
  | "HexagonLayer"
  | "ScreenGridLayer"
  | "ColumnLayer";

const FILL_COLOR_OPTIONS: { name: string, value: [number, number, number, number] }[] = [
    { name: 'Orange', value: [255, 140, 0, 180] },
    { name: 'Blue', value: [50, 130, 255, 180] },
    { name: 'Green', value: [0, 200, 100, 180] },
    { name: 'Purple', value: [138, 43, 226, 180] },
];

const HEATMAP_COLOR_OPTIONS: { name: string, value: [number, number, number][] }[] = [
    { name: 'Classic', value: [ [255, 255, 178], [254, 217, 118], [254, 178, 76], [253, 141, 60], [240, 59, 32], [189, 0, 38] ] },
    { name: 'Viridis', value: [ [68, 1, 84], [72, 40, 120], [62, 74, 137], [49, 104, 142], [38, 130, 142], [31, 158, 137], [53, 183, 121], [109, 205, 89], [180, 222, 44], [253, 231, 37] ] },
    { name: 'Magma', value: [ [0, 0, 3], [28, 16, 68], [79, 18, 123], [129, 37, 128], [181, 54, 122], [229, 81, 100], [251, 135, 97], [254, 194, 135], [252, 253, 191] ]},
    { name: 'Blues', value: [ [247, 251, 255], [222, 235, 247], [198, 219, 239], [158, 202, 225], [107, 174, 214], [66, 146, 198], [33, 113, 181], [8, 81, 156], [8, 48, 107] ]},
]

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
          colorRange: HEATMAP_COLOR_OPTIONS[0].value,
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
          colorRange: HEATMAP_COLOR_OPTIONS[0].value,
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
    
    const handleColorChange = (layerId: string, color: [number, number, number, number]) => {
      updateLayerConfig(layerId, { getFillColor: color });
    }

    const handleColorRangeChange = (layerId: string, colorRange: [number, number, number][]) => {
      updateLayerConfig(layerId, { colorRange });
    }

  return (
    <div className="space-y-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={data.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Layer
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

      <SmartLayerSuggestionsPanel />

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Active Layers</h3>
        {layers.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
            No layers added yet.
          </div>
        ) : (
          layers.map((layer) => {
            const hasFillColor = layer.config.hasOwnProperty('getFillColor');
            const hasColorRange = layer.config.hasOwnProperty('colorRange');
            return (
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
                     {hasFillColor && (
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex items-center gap-2">
                                {FILL_COLOR_OPTIONS.map(color => (
                                    <button
                                        key={color.name}
                                        title={color.name}
                                        onClick={() => handleColorChange(layer.id, color.value)}
                                        className={cn(
                                            "h-6 w-6 rounded-full border-2 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                            JSON.stringify(layer.config.getFillColor) === JSON.stringify(color.value) ? 'border-primary' : 'border-transparent'
                                        )}
                                        style={{ backgroundColor: `rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 0.7)` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {hasColorRange && (
                         <div className="space-y-2">
                            <Label>Color Ramp</Label>
                             <div className="flex items-center gap-2">
                                {HEATMAP_COLOR_OPTIONS.map(palette => (
                                     <button
                                        key={palette.name}
                                        title={palette.name}
                                        onClick={() => handleColorRangeChange(layer.id, palette.value)}
                                        className={cn(
                                            "h-6 w-full rounded border-2 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                            JSON.stringify(layer.config.colorRange) === JSON.stringify(palette.value) ? 'border-primary' : 'border-transparent'
                                        )}
                                        style={{ background: `linear-gradient(to right, ${palette.value.map(c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`).join(', ')})` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CollapsibleContent>
                </Collapsible>
            )
        })
        )}
      </div>
    </div>
  );
}

    