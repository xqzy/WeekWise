'use server';

/**
 * @fileOverview Learns user's schedule patterns to improve future schedule accuracy.
 *
 * - learnSchedulePatterns - A function that triggers the learning process.
 * - LearnSchedulePatternsInput - The input type for the learnSchedulePatterns function.
 * - LearnSchedulePatternsOutput - The return type for the learnSchedulePatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearnSchedulePatternsInputSchema = z.object({
  jiraItemId: z.string().describe('The ID of the Jira item.'),
  estimatedTime: z.number().describe('The estimated time to complete the Jira item in hours.'),
  actualTime: z.number().describe('The actual time taken to complete the Jira item in hours.'),
  manualAdjustments: z
    .string()
    .optional()
    .describe(
      'A description of any manual adjustments made to the schedule for this Jira item, and why.'
    ),
});
export type LearnSchedulePatternsInput = z.infer<typeof LearnSchedulePatternsInputSchema>;

const LearnSchedulePatternsOutputSchema = z.object({
  success: z.boolean().describe('Whether the learning process was successful.'),
  message: z.string().describe('A message indicating the outcome of the learning process.'),
});
export type LearnSchedulePatternsOutput = z.infer<typeof LearnSchedulePatternsOutputSchema>;

export async function learnSchedulePatterns(
  input: LearnSchedulePatternsInput
): Promise<LearnSchedulePatternsOutput> {
  return learnSchedulePatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learnSchedulePatternsPrompt',
  input: {schema: LearnSchedulePatternsInputSchema},
  output: {schema: LearnSchedulePatternsOutputSchema},
  prompt: `You are an AI assistant that learns user scheduling patterns to improve future schedule accuracy.

You will analyze the provided data to understand the user's velocity of completing Jira items and the impact of manual schedule adjustments.

Based on the data, you will determine whether the learning process was successful and provide a message indicating the outcome.

Jira Item ID: {{{jiraItemId}}}
Estimated Time: {{{estimatedTime}}} hours
Actual Time: {{{actualTime}}} hours
Manual Adjustments: {{{manualAdjustments}}}

Consider these factors when determining success:
- Significant difference between estimated and actual time, indicating a need to adjust velocity estimates.
- Clear reasons for manual adjustments, suggesting predictable scheduling conflicts or preferences.

Return a JSON object with "success" set to true if the learning process resulted in valuable insights, and false otherwise. Include a descriptive "message" explaining the outcome.
`,
});

const learnSchedulePatternsFlow = ai.defineFlow(
  {
    name: 'learnSchedulePatternsFlow',
    inputSchema: LearnSchedulePatternsInputSchema,
    outputSchema: LearnSchedulePatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
