/**
 * @fileoverview This file initializes the Genkit AI platform.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This allows the application to use Google's generative AI models.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // Enable production-ready monitoring and tracing.
  enableTracingAndMetrics: true,
});
