'use server';
/**
 * @fileOverview An AI flow for generating professional ophthalmic referral letters.
 *
 * - generateReferralLetter - A function that takes clinical findings and returns a structured letter.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ReferralInputSchema = z.object({
  patientAge: z.number().describe('Age of the patient.'),
  patientSex: z.string().describe('Sex of the patient.'),
  vaOd: z.string().describe('Visual Acuity Right Eye.'),
  vaOs: z.string().describe('Visual Acuity Left Eye.'),
  iopOd: z.string().optional().describe('IOP Right Eye.'),
  iopOs: z.string().optional().describe('IOP Left Eye.'),
  findings: z.string().describe('Detailed clinical findings and observations.'),
  suspectedDiagnosis: z.string().describe('The suspected condition or reason for referral.'),
  urgency: z.enum(['Routine', 'Urgent', 'Emergency']).describe('The clinical urgency of the referral.'),
});
export type ReferralInput = z.infer<typeof ReferralInputSchema>;

const ReferralOutputSchema = z.object({
  letterContent: z.string().describe('The full text of the professional referral letter in Markdown format.'),
  keyPoints: z.array(z.string()).describe('A summary of key points included in the letter.'),
});
export type ReferralOutput = z.infer<typeof ReferralOutputSchema>;

export async function generateReferralLetter(input: ReferralInput): Promise<ReferralOutput> {
  return referralLetterFlow(input);
}

const referralPrompt = ai.definePrompt({
  name: 'referralPrompt',
  input: { schema: ReferralInputSchema },
  output: { schema: ReferralOutputSchema },
  prompt: `You are an expert optometrist writing a clinical referral letter to an ophthalmologist (HES). 

Your goal is to produce a clear, professional, and concise letter that highlights the most critical findings and justifies the suspected diagnosis and urgency.

**Patient Details:**
- Age: {{patientAge}}
- Sex: {{patientSex}}

**Clinical Findings:**
- VA OD: {{vaOd}}
- VA OS: {{vaOs}}
{{#if iopOd}} - IOP OD: {{iopOd}} mmHg{{/if}}
{{#if iopOs}} - IOP OS: {{iopOs}} mmHg{{/if}}

**Observations:**
{{{findings}}}

**Reason for Referral / Suspected Diagnosis:**
{{{suspectedDiagnosis}}}

**Urgency:**
{{urgency}}

Please structure the letter with:
1. Patient demographics.
2. Clear statement of the reason for referral.
3. Relevant history and clinical findings.
4. Professional sign-off.

The output should be in Markdown format.`,
});

const referralLetterFlow = ai.defineFlow(
  {
    name: 'referralLetterFlow',
    inputSchema: ReferralInputSchema,
    outputSchema: ReferralOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await referralPrompt(input);
      if (!output) throw new Error('AI failed to generate the letter.');
      return output;
    } catch (error) {
      console.error('Error in referralLetterFlow:', error);
      throw error;
    }
  }
);
