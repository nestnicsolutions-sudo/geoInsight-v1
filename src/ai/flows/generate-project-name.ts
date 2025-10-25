'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a project name based on the data description provided by the user.
 *
 * - generateProjectName - A function that takes a data description and returns a suggested project name.
 * - GenerateProjectNameInput - The input type for the generateProjectName function.
 * - GenerateProjectNameOutput - The return type for the generateProjectName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectNameInputSchema = z.object({
  dataDescription: z.string().describe('A description of the data to be visualized in the project.'),
});
export type GenerateProjectNameInput = z.infer<typeof GenerateProjectNameInputSchema>;

const GenerateProjectNameOutputSchema = z.object({
  projectName: z.string().describe('A suggested name for the project based on the data description.'),
});
export type GenerateProjectNameOutput = z.infer<typeof GenerateProjectNameOutputSchema>;

export async function generateProjectName(input: GenerateProjectNameInput): Promise<GenerateProjectNameOutput> {
  return generateProjectNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectNamePrompt',
  input: {schema: GenerateProjectNameInputSchema},
  output: {schema: GenerateProjectNameOutputSchema},
  prompt: `You are an expert project naming assistant. Given a description of the data that will be visualized in a project, suggest a concise and relevant name for the project.

Data Description: {{{dataDescription}}}

Project Name:`,
});

const generateProjectNameFlow = ai.defineFlow(
  {
    name: 'generateProjectNameFlow',
    inputSchema: GenerateProjectNameInputSchema,
    outputSchema: GenerateProjectNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
