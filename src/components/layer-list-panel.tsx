"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";
import { useStore, DataRecord } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  ScatterplotLayer,
  ColumnLayer,
} from "@deck.gl/layers";
import {
  HeatmapLayer,
  HexagonLayer,
  ScreenGridLayer,
} from "@deck.gl/aggregation-layers";
import type { Layer } from "@deck.gl/core";

type LayerType =
  | "ScatterplotLayer"
  | "HeatmapLayer"
  | "HexagonLayer"
  | "ScreenGridLayer"
  | "ColumnLayer";

export default function LayerListPanel() {
  const { addLayer, layers, data, mappedColumns } = useStore();
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

    let newLayer: Layer;

    const baseProps = {
      id: `${layerType.toLowerCase()}-${Date.now()}`,
      data,
      pickable: true,
      getPosition: (d: DataRecord) => [
        Number(d[mappedColumns.longitude!]),
        Number(d[mappedColumns.latitude!]),
      ],
    };

    switch (layerType) {
      case "ScatterplotLayer":
        newLayer = new ScatterplotLayer({
          ...baseProps,
          opacity: 0.8,
          stroked: true,
          filled: true,
          radiusScale: 6,
          radiusMinPixels: 3,
          radiusMaxPixels: 100,
          lineWidthMinPixels: 1,
          getFillColor: [255, 140, 0, 180],
          getLineColor: [0, 0, 0],
        });
        break;
      case "HeatmapLayer":
        newLayer = new HeatmapLayer({
          ...baseProps,
          intensity: 1,
          threshold: 0.03,
          radiusPixels: 30,
        });
        break;
      case "HexagonLayer":
        newLayer = new HexagonLayer({
          ...baseProps,
          extruded: true,
          radius: 2000,
          elevationScale: 4,
          getElevationValue: (points: any[]) => points.length,
        });
        break;
      case "ScreenGridLayer":
        newLayer = new ScreenGridLayer({
          ...baseProps,
          cellSizePixels: 40,
          colorRange: [
            [0, 25, 0, 25],
            [0, 85, 0, 85],
            [0, 127, 0, 127],
            [0, 170, 0, 170],
            [0, 190, 0, 190],
            [0, 255, 0, 255],
          ],
        });
        break;
       case "ColumnLayer":
        newLayer = new ColumnLayer({
            ...baseProps,
            diskResolution: 12,
            radius: 2500,
            extruded: true,
            getElevation: 500,
            getFillColor: [255, 140, 0, 180],
        });
        break;
      default:
        toast({
          variant: "destructive",
          title: "Unknown Layer Type",
          description: "The selected layer type is not supported.",
        });
        return;
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

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add and configure your visualization layers.
      </p>
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

      <div className="space-y-2">
        {layers.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
            No layers added yet.
          </div>
        ) : (
          layers.map((layer, index) => (
            <div
              key={layer.id}
              className="p-3 text-sm border rounded-lg bg-secondary/50"
            >
              <div className="font-medium">
                Layer {index + 1}: {capitalizeFirstLetter(layer.id.split('-')[0])}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
