"use client"

import * as React from "react"
import { Globe } from "lucide-react"
import { useStore } from "@/lib/store"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const baseMaps = [
    { name: 'Dark', style: 'mapbox://styles/mapbox/dark-v11' },
    { name: 'Light', style: 'mapbox://styles/mapbox/light-v11' },
    { name: 'Streets', style: 'mapbox://styles/mapbox/streets-v12' },
    { name: 'Outdoors', style: 'mapbox://styles/mapbox/outdoors-v12' },
    { name: 'Satellite', style: 'mapbox://styles/mapbox/satellite-v9' },
    { name: 'Satellite Streets', style: 'mapbox://styles/mapbox/satellite-streets-v12' },
    { name: 'Navigation Day', style: 'mapbox://styles/mapbox/navigation-day-v1' },
    { name: 'Navigation Night', style: 'mapbox://styles/mapbox/navigation-night-v1' },
];

export function BaseMapToggle() {
  const { baseMap, setBaseMap } = useStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle base map</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Base Map Style</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={baseMap} onValueChange={setBaseMap}>
            {baseMaps.map((map) => (
                 <DropdownMenuRadioItem key={map.style} value={map.style}>
                    {map.name}
                </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
