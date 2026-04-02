
/**
 * @fileoverview This file initializes the Genkit AI platform.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize Genkit with the Google AI plugin.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Define a default model for the entire application.
  model: googleAI.model('gemini-2.5-flash'),
  enableTracingAndMetrics: true,
});
