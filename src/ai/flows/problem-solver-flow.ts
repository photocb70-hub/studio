
'use server';
/**
 * @fileOverview An AI-based problem solver for optical scenarios.
 *
 * - solveProblem - A function that takes a user's query about an optical problem and returns a structured solution.
 * - ProblemSolverInput - The input type for the solveProblem function.
 * - ProblemSolverOutput - The return type for the solveProblem function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'zod';

// Define the input schema for the problem solver
const ProblemSolverInputSchema = z.object({
  query: z.string().describe('A detailed description of the optical problem or patient scenario.'),
});
export type ProblemSolverInput = z.infer<typeof ProblemSolverInputSchema>;

// Define the output schema for the problem solver
const ProblemSolverOutputSchema = z.object({
  analysis: z.string().describe("A brief analysis of the core issue, identifying likely causes based on the scenario."),
  solution: z.string().describe('A step-by-step recommended solution or course of action based on the analysis.'),
  considerations: z.string().describe('Any further considerations, warnings, or alternative approaches the user should be aware of.'),
});
export type ProblemSolverOutput = z.infer<typeof ProblemSolverOutputSchema>;

// Exported wrapper function to be called from the UI
export async function solveProblem(input: ProblemSolverInput): Promise<ProblemSolverOutput> {
  return problemSolverFlow(input);
}

// Define the Genkit prompt
const problemSolverPrompt = ai.definePrompt({
  name: 'problemSolverPrompt',
  input: { schema: ProblemSolverInputSchema },
  output: { schema: ProblemSolverOutputSchema },
  model: googleAI('gemini-1.5-flash-latest'),
  prompt: `You are an expert ophthalmic optician and AI problem solver. A user has presented you with the following optical scenario.

Your task is to:
1.  Thoroughly analyze the scenario described.
2.  Based on your analysis, identify the most likely cause(s) of the patient's complaint.
3.  Formulate a clear, actionable, step-by-step solution.
4.  List any important further considerations or alternative approaches.

Your response must be professional, accurate, and easy for an optical professional to understand. You must respond in the requested structured format.

**Patient Scenario:**
{{{query}}}
`,
});

// Define the Genkit flow
const problemSolverFlow = ai.defineFlow(
  {
    name: 'problemSolverFlow',
    inputSchema: ProblemSolverInputSchema,
    outputSchema: ProblemSolverOutputSchema,
  },
  async (input) => {
    const { output } = await problemSolverPrompt(input);
    if (!output) {
      throw new Error("The AI failed to produce a valid response.");
    }
    return output;
  }
);

