
'use server';
/**
 * @fileOverview An AI-based problem solver for optical dispensing issues.
 *
 * - solveProblem - A function that takes a user's scenario and returns a structured analysis.
 * - ProblemSolverInput - The input type for the solveProblem function.
 * - ProblemSolverOutput - The return type for the solveProblem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const rxSchema = z.object({
    sphere: z.number().optional(),
    cylinder: z.number().optional(),
    axis: z.number().optional(),
    add: z.string().optional(),
    prism: z.string().optional(),
    base: z.string().optional(),
    pd: z.string().optional(),
    hts: z.string().optional(),
});

const ProblemSolverInputSchema = z.object({
  problem: z.string().describe("The primary complaint or issue the patient is experiencing."),
  currentRx: rxSchema.optional().describe("The patient's current, new prescription details."),
  previousRx: rxSchema.optional().describe("The patient's previous prescription details, for comparison."),
  lens: z.object({
    type: z.string().optional().describe("The type or design of the lens (e.g., Single Vision, Varifocal)."),
    material: z.string().optional().describe("The lens material or refractive index."),
  }).optional(),
  isKnob: z.boolean().optional().describe("A humorous, secret flag indicating if the user believes the patient is being difficult. The AI should factor this in with a touch of wit."),
});
export type ProblemSolverInput = z.infer<typeof ProblemSolverInputSchema>;

const ProblemSolverOutputSchema = z.object({
  analysis: z.string().describe("A detailed analysis of the potential root causes of the problem, considering all provided data."),
  solution: z.string().describe("A step-by-step recommended solution or set of actions to resolve the issue. This should be formatted with markdown for lists."),
  considerations: z.string().describe("A list of other potential factors or further considerations the user should keep in mind."),
});
export type ProblemSolverOutput = z.infer<typeof ProblemSolverOutputSchema>;

export async function solveProblem(input: ProblemSolverInput): Promise<ProblemSolverOutput> {
  return problemSolverFlow(input);
}

const problemSolverPrompt = ai.definePrompt({
    name: 'problemSolverPrompt',
    input: { schema: ProblemSolverInputSchema },
    output: { schema: ProblemSolverOutputSchema },
    prompt: `You are an expert optical dispenser and problem solver. A user has submitted the following dispensing scenario.

    Analyze the provided information, including the primary complaint, current and previous prescriptions, and lens details.
    
    Your task is to:
    1.  Provide a detailed analysis of the potential root causes of the problem.
    2.  Recommend a clear, step-by-step solution. Format this as a markdown list.
    3.  List any other considerations the user should be aware of.
    4.  If the 'isKnob' flag is true, acknowledge this with a touch of humor and empathy in your 'considerations' section, emphasizing the importance of patient communication.
    
    Problem: {{{problem}}}
    
    Current Rx:
    - Sphere: {{currentRx.sphere}}
    - Cylinder: {{currentRx.cylinder}}
    - Axis: {{currentRx.axis}}
    - Add: {{currentRx.add}}
    
    Previous Rx:
    - Sphere: {{previousRx.sphere}}
    - Cylinder: {{previousRx.cylinder}}
    - Axis: {{previousRx.axis}}

    Lens Details:
    - Type: {{lens.type}}
    - Material: {{lens.material}}
    `,
});

const problemSolverFlow = ai.defineFlow(
    {
        name: 'problemSolverFlow',
        inputSchema: ProblemSolverInputSchema,
        outputSchema: ProblemSolverOutputSchema,
    },
    async (input) => {
        const { output } = await problemSolverPrompt(input);
        if (!output) {
            throw new Error('The AI model failed to produce a valid output.');
        }
        return output;
    }
);
