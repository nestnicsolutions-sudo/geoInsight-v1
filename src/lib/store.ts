import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ViewState } from 'react-map-gl';

// Define the structure for raw data
interface RawData {
    name: string;
    content: string; // Could be CSV string, JSON string etc.
}

interface AppState {
    projectName: string;
    setProjectName: (name: string) => void;

    rawData: RawData | null;
    setRawData: (data: RawData | null) => void;
    
    // map state
    viewport: ViewState;
    setViewport: (viewport: ViewState) => void;
}

export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      projectName: 'Untitled Project',
      setProjectName: (name) => set({ projectName: name }),

      rawData: null,
      setRawData: (data) => set({ rawData: data }),

      viewport: {
        longitude: -98.5795,
        latitude: 39.8283,
        zoom: 4,
        pitch: 0,
        bearing: 0,
        padding: { top: 20, bottom: 20, left: 20, right: 20 }
      },
      setViewport: (viewport) => set({ viewport }),
    }),
    { name: 'GeoInsightStore' }
  )
);
