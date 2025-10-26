
'use server';

/**
 * @fileOverview Provides smart layer suggestions based on uploaded data and column mappings.
 *
 * - suggestLayers - A function that suggests Deck.GL layer types and configurations.
 * - SmartLayerSuggestionsInput - The input type for the suggestLayers function.
 * - SmartLayerSuggestionsOutput - The return type for the suggestLayers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartLayerSuggestionsInputSchema = z.object({
  columnTypes: z
    .record(z.string(), z.string())
    .describe(
      'A map of column names to their data types (e.g., {latitude: number, longitude: number, value: number, category: string}).'
    ),
  columnNames: z
    .array(z.string())
    .describe('A list of column names in the uploaded data.'),
  mappedLatitude: z
    .string()
    .optional()
    .describe('The column name mapped to latitude.'),
  mappedLongitude: z
    .string()
    .optional()
    .describe('The column name mapped to longitude.'),
  mappedValue: z
    .string()
    .optional()
    .describe('The column name mapped to a numerical value/metric.'),
  mappedCategory: z
    .string()
    .optional()
    .describe('The column name mapped to a category/label.'),
});

export type SmartLayerSuggestionsInput = z.infer<
  typeof SmartLayerSuggestionsInputSchema
>;

const SmartLayerSuggestionsOutputSchema = z.array(z.object({
  layerType: z.string().describe('The suggested Deck.GL layer type.'),
  initialConfiguration: z
    .record(z.string(), z.any())
    .describe('Recommended initial configuration options for the layer.'),
  rationale: z
    .string()
    .describe('Explanation of why this layer type is suitable.'),
}));

export type SmartLayerSuggestionsOutput = z.infer<
  typeof SmartLayerSuggestionsOutputSchema
>;

export async function suggestLayers(
  input: SmartLayerSuggestionsInput
): Promise<SmartLayerSuggestionsOutput> {
  return suggestLayersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartLayerSuggestionsPrompt',
  input: {schema: SmartLayerSuggestionsInputSchema},
  output: {schema: SmartLayerSuggestionsOutputSchema},
  prompt: `You are an expert in data visualization using Deck.GL.

  Based on the following data column types and mappings, suggest up to 3 suitable Deck.GL layer types and initial configurations. Provide a rationale for each suggestion.

  Column Types: {{{JSON.stringify(columnTypes)}}}
  Column Names: {{{JSON.stringify(columnNames)}}}
  Mapped Latitude Column: {{{mappedLatitude}}}
  Mapped Longitude Column: {{{mappedLongitude}}}
  Mapped Value Column: {{{mappedValue}}}
  Mapped Category Column: {{{mappedCategory}}}

  Guidelines:
  - If latitude and longitude are present, ScatterplotLayer is almost always a good primary choice.
  - If a 'value' column is mapped, consider layers that use it for aggregation or magnitude, like HeatmapLayer or HexagonLayer.
  - HexagonLayer is good for showing density of points in an area.
  - HeatmapLayer shows intensity or density as a smooth color gradient.
  - If a 'value' is present and represents magnitude at a point (not for aggregation), ColumnLayer is great for showing this in 3D.
  - ScatterplotLayer can use the 'value' for radius and the 'category' for color.
  - Only suggest layers that are appropriate for the provided mappings. For example, do not suggest ColumnLayer or HeatmapLayer if there is no mapped 'value' column.
  
  Available Layer Types:
  - ScatterplotLayer
  - HexagonLayer
  - HeatmapLayer
  - ColumnLayer

  Return an array of layer suggestions. Each suggestion must include:
  1.  'layerType': A valid Deck.GL layer name from the available list.
  2.  'initialConfiguration': A JSON object with sensible default settings. This MUST include 'opacity' (set to 0.8) and a color configuration. For ScatterplotLayer, include radius settings. For HexagonLayer, include 'radius' and 'elevationScale'. For HeatmapLayer, include 'radiusPixels' and 'intensity'. For ColumnLayer, include 'radius' and a 'getFillColor'.
  3.  'rationale': A short, concise explanation for why the layer is a good fit.

  The output must be a valid JSON array. If no suggestions can be made, return an empty array.
  `,
});

const suggestLayersFlow = ai.defineFlow(
  {
    name: 'suggestLayersFlow',
    inputSchema: SmartLayerSuggestionsInputSchema,
    outputSchema: SmartLayerSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
