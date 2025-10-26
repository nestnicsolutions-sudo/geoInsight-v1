import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Specify the model family for text-only prompts
      textModel: 'gemini-1.5-flash-preview',
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});
