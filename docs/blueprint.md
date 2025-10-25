# **App Name**: GeoInsight

## Core Features:

- Data Upload and Parsing: Allows users to upload CSV, XLSX, or GeoJSON files, parse them using PapaParse or SheetJS, and validate the structure.
- Column Mapping: Provides a column mapping interface for users to manually map latitude, longitude, metric, and category columns.
- Deck.GL Visualization: Visualizes spatial data using Deck.GL with support for ScatterplotLayer, HexagonLayer, HeatmapLayer, GeoJsonLayer, ArcLayer, ScreenGridLayer, IconLayer, and ColumnLayer.
- Multi-Layer Management: Enables users to add multiple layers, toggle visibility, reorder layers, and save layer configurations.
- Map Controls and Interactions: Implements pan, zoom, pitch, and bearing controls; enables hover tooltips, feature selection, and an info panel for selected features.
- Chart Panel: Displays complementary charts (histogram, bar chart, line chart, pie chart, scatter plot, and summary statistics) using Recharts.
- Project Management with Firestore: Allows users to save and load visualization projects to their user account.

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5) to evoke a sense of stability and trust in data visualization.
- Background color: Light Gray (#F0F2F5), providing a neutral backdrop to emphasize the data.
- Accent color: Orange (#FF9800) to highlight interactive elements and important data points.
- Body font: 'Inter', sans-serif, for clean and modern readability. Headline font: 'Space Grotesk', sans-serif, for impactful titles.
- Code font: 'Source Code Pro' for any code snippets displayed (such as configuration settings).
- Use clear and consistent icons from Lucide React to represent different layer types and controls.
- Maintain a clear, structured layout as shown above, separating control panels, the map canvas, and chart panels for optimal user experience.