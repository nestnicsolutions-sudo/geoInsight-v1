'use server';
/**
 * @fileOverview This file contains the AI flow for suggesting latitude and longitude columns.
 *
 * - suggestLatLng - A function that suggests latitude and longitude columns from a list of column names.
 * - SuggestLatLngInput - The input type for the suggestLatLng function.
 * - SuggestLatLngOutput - The return type for the suggestLatLng function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestLatLngInputSchema = z.object({
  columnNames: z.array(z.string()).describe('A list of column names from the user\'s uploaded data.'),
});
export type SuggestLatLngInput = z.infer<typeof SuggestLatLngInputSchema>;

const SuggestLatLngOutputSchema = z.object({
    latitude: z.string().nullable().describe('The identified latitude column name. Null if not found.'),
    longitude: z.string().nullable().describe('The identified longitude column name. Null if not found.'),
});
export type SuggestLatLngOutput = z.infer<typeof SuggestLatLngOutputSchema>;

const suggestLatLngFlow = ai.defineFlow(
  {
    name: 'suggestLatLngFlow',
    inputSchema: SuggestLatLngInputSchema,
    outputSchema: SuggestLatLngOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-preview',
      prompt: `
        You are an expert data analyst specializing in geospatial data.
        Your task is to identify the latitude and longitude columns from a given list of column names.

        Column Names: ${JSON.stringify(input.columnNames)}

        Analyze the column names and determine which one likely represents latitude and which one represents longitude.
        Common names for latitude include 'lat', 'latitude', 'y', 'lat_num'.
        Common names for longitude include 'lon', 'long', 'longitude', 'x', 'long_num'.

        Return the identified column names. If you cannot confidently identify one or both, return null for the respective field.
      `,
      output: {
        schema: SuggestLatLngOutputSchema,
      },
      config: {
        temperature: 0,
      }
    });

    return output!;
  }
);


export async function suggestLatLng(input: SuggestLatLngInput): Promise<SuggestLatLngOutput> {
    return suggestLatLngFlow(input);
}
