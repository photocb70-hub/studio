
'use server';
/**
 * @fileOverview An AI-based problem solver for optical dispensing issues.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { searchWeb } from '@/ai/tools/search-tool';

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

const binocularRxSchema = z.object({
    od: rxSchema,
    os: rxSchema,
});

const ProblemSolverInputSchema = z.object({
  problem: z.string().describe("The primary complaint or issue the patient is experiencing."),
  currentRx: binocularRxSchema,
  previousRx: binocularRxSchema,
  lens: z.object({
    type: z.string().optional().describe("The type or design of the lens (e.g., Single Vision, Varifocal)."),
    material: z.string().optional().describe("The lens material or refractive index."),
  }).optional(),
  isKnob: z.boolean().optional().describe("A humorous, secret flag indicating if the user believes the patient is being difficult. The AI should factor this in with a touch of wit."),
});
export type ProblemSolverInput = z.infer<typeof ProblemSolverInputSchema>;

const ProblemSolverOutputSchema = z.object({
  analysis: z.string().describe("A detailed analysis of the potential root causes of the problem, considering all provided data. This should be specific and avoid generalizations."),
  solution: z.string().describe("A step-by-step recommended solution or set of actions to resolve the issue. This should be formatted with markdown for lists."),
  considerations: z.string().describe("A list of other potential factors or further considerations the user should keep in mind."),
});
export type ProblemSolverOutput = z.infer<typeof ProblemSolverOutputSchema>;

export async function solveProblem(input: ProblemSolverInput): Promise<ProblemSolverOutput> {
  try {
    return await problemSolverFlow(input);
  } catch (error) {
    console.error('Error in solveProblem:', error);
    throw error;
  }
}

const problemSolverPrompt = ai.definePrompt({
    name: 'problemSolverPrompt',
    model: googleAI.model('gemini-2.5-flash'),
    input: { schema: ImageAnalyzerInputSchema },
    output: { schema: ProblemSolverOutputSchema },
    tools: [searchWeb],
    prompt: `You are an expert optical dispenser and problem solver. A user has submitted the following dispensing scenario.

    Your task is to provide a highly specific and tailored analysis. Do not make generic statements.
    
    1.  **Analyze the Data**: Carefully compare the current and previous prescriptions.
        -   If there is a change in sphere, cylinder, or axis, comment on that specific change and its likely impact.
        -   If there is **no change**, state that the prescription is stable and the cause likely lies elsewhere (e.g., measurements, lens type). Do not invent a prescription change.
        -   Consider the lens type, material, and patient complaint.
    2.  **Provide a Solution**: Recommend a clear, step-by-step solution based on your specific analysis. Format this as a markdown list.
    3.  **List Considerations**: Note any other factors (e.g., fitting measurements, previous lens history).
    4.  **Use Your Tools**: If the query involves a new or complex technology, use the \`searchWeb\` tool to find the most up-to-date information to inform your answer.
    5.  **(Secret Rule)** If the 'isKnob' flag is true, acknowledge this with a touch of humor and empathy in your 'considerations' section, emphasizing the importance of patient communication.

    **Scenario Details**

    - **Primary Complaint**: {{{problem}}}
    
    - **Current Prescription**:
      - OD: R: {{currentRx.od.sphere}} / {{currentRx.od.cylinder}} x {{currentRx.od.axis}}
      - OS: L: {{currentRx.os.sphere}} / {{currentRx.os.cylinder}} x {{currentRx.os.axis}}
    
    - **Previous Prescription**:
      - OD: R: {{previousRx.od.sphere}} / {{previousRx.od.cylinder}} x {{previousRx.od.axis}}
      - OS: L: {{previousRx.os.sphere}} / {{previousRx.os.cylinder}} x {{previousRx.os.axis}}

    - **Lens Details**:
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
        try {
          const { output } = await problemSolverPrompt(input);
          if (!output) {
              throw new Error('The AI model failed to produce a valid output.');
          }
          return output;
        } catch (error) {
          console.error('Error in problemSolverFlow:', error);
          throw error;
        }
    }
);
