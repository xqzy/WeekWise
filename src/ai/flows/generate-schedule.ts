
'use server';

/**
 * @fileOverview Generates a balanced 7-day schedule by integrating Jira tasks and Google Calendar appointments,
 * respecting unavailable hours and task deadlines.
 *
 * - generateSchedule - A function that generates the schedule.
 * - GenerateScheduleInput - The input type for the generateSchedule function.
 * - GenerateScheduleOutput - The return type for the generateSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { JiraTaskSchema, CalendarEventSchema } from '@/ai/schemas/common';

const GenerateScheduleInputSchema = z.object({
  currentDate: z.string().date().describe('The starting date for the 7-day schedule, in YYYY-MM-DD format.'),
  manualJiraTasks: z
    .array(JiraTaskSchema)
    .optional()
    .describe('Manually provided or fetched Jira tasks.'),
  manualCalendarEvents: z
    .array(CalendarEventSchema)
    .optional()
    .describe('Manually provided or fetched Google Calendar events.'),
  unavailableHours: z
    .array(z.object({
      dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
      startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    }))
    .describe('An array of unavailable hours.'),
});

export type GenerateScheduleInput = z.infer<typeof GenerateScheduleInputSchema>;

const ScheduledItemSchema = z.object({
  name: z.string().describe('The full name of the event or task.'),
  startTime: z.string().describe('The start time of the event or task (ISO format).'),
  endTime: z.string().describe('The end time of the event or task (ISO format).'),
  link: z.string().optional().describe('Link to original event resource. Must be a valid URL.'),
  type: z.enum(['jira', 'calendar']).describe('The type of the scheduled item.'),
  projectKey: z.string().optional().describe('For Jira tasks, the project key (e.g., "KAN", "SZH").'),
  deadline: z.string().optional().describe('The deadline of the task in YYYY-MM-DD format, if applicable.'),
});

const GenerateScheduleOutputSchema = z.object({
  schedule: z.array(ScheduledItemSchema).describe('A 7-day schedule of tasks and events.'),
});

export type GenerateScheduleOutput = z.infer<typeof GenerateScheduleOutputSchema>;

export async function generateSchedule(input: GenerateScheduleInput): Promise<GenerateScheduleOutput> {
  return generateScheduleFlow(input);
}

// This is the schema for the data that will be passed to the prompt itself
const PromptInputSchema = z.object({
  currentDate: z.string().describe("The starting date for the 7-day schedule, in YYYY-MM-DD format."),
  allJiraTasks: z.array(JiraTaskSchema).describe("All Jira tasks to be scheduled."),
  allCalendarEvents: z.array(CalendarEventSchema).describe("All Google Calendar events to be scheduled."),
  unavailableHours: GenerateScheduleInputSchema.shape.unavailableHours,
});


const generateSchedulePrompt = ai.definePrompt({
  name: 'generateSchedulePrompt',
  input: {schema: PromptInputSchema},
  output: {schema: GenerateScheduleOutputSchema},
  prompt: `You are an AI scheduling assistant. Your goal is to create a balanced 7-day schedule for the user, starting from {{currentDate}}.
You need to integrate their Jira tasks and Google Calendar appointments, while respecting their unavailable hours and task deadlines.

Current Date for planning: {{currentDate}}

User's Jira tasks to schedule (each Jira task should be allocated 1 hour):
{{#if allJiraTasks}}
{{#each allJiraTasks}}
- Name: {{name}}, Project: {{projectKey}}{{#if link}}, Link: {{link}}{{/if}}{{#if deadline}}, Deadline: {{deadline}}{{/if}}
{{/each}}
{{else}}
- No Jira tasks provided or fetched.
{{/if}}

User's Google Calendar appointments to schedule:
{{#if allCalendarEvents}}
{{#each allCalendarEvents}}
- Name: {{name}}, Start Time: {{startTime}}, End Time: {{endTime}}{{#if link}}, Link: {{link}}{{/if}}
{{/each}}
{{else}}
- No calendar events provided or fetched.
{{/if}}

User's unavailable hours (these are times they CANNOT work or have events):
{{#each unavailableHours}}
- Day: {{dayOfWeek}}, Start Time: {{startTime}}, End Time: {{endTime}}
{{/each}}

Create a 7-day schedule starting from {{currentDate}}.
- Each Jira task must be scheduled for a 1-hour block.
- Calendar events must be scheduled at their specified times.
- For each scheduled item, you must include its original name in the 'name' field.
- For each scheduled Jira item, you must include its 'projectKey' in the output.
- When scheduling a Jira task, you MUST copy its original 'deadline' from the input data to the 'deadline' field in the output JSON if one exists.
- Unavailable hours must be respected.
- Ensure the output times are in ISO 8601 format.
- Prioritize scheduling existing calendar events first.
- Next, you MUST schedule tasks to be completed before their specified deadlines.
- If a task's deadline has already passed (the deadline is before {{currentDate}}), you must schedule it as soon as possible, ignoring the rule about distributing tasks evenly.
- For all other tasks with deadlines, schedule them before their deadline while trying to distribute them throughout the week to create a balanced workload.
- For tasks with no deadline, distribute them evenly throughout available slots in the 7 days.

Return the schedule in the following JSON format:
{{ zodToJsonOutputSchema }}`,
});

const generateScheduleFlow = ai.defineFlow(
  {
    name: 'generateScheduleFlow',
    inputSchema: GenerateScheduleInputSchema,
    outputSchema: GenerateScheduleOutputSchema,
  },
  async (input) => {
    console.log("Entering generateScheduleFlow");
    
    // Data is now pre-fetched and provided directly in the input.
    const allJiraTasks = input.manualJiraTasks || [];
    const allCalendarEvents = input.manualCalendarEvents || [];

    const uniqueJiraTasks = Array.from(new Map(allJiraTasks.map(task => [task.name, task])).values());
    const uniqueCalendarEvents = Array.from(new Map(allCalendarEvents.map(event => [event.name, event])).values());

    const promptData: z.infer<typeof PromptInputSchema> = {
      currentDate: input.currentDate,
      allJiraTasks: uniqueJiraTasks,
      allCalendarEvents: uniqueCalendarEvents,
      unavailableHours: input.unavailableHours,
    };

    console.log("Prompt Data:", JSON.stringify(promptData, null, 2));
    const {output} = await generateSchedulePrompt(promptData);
    console.log("Exiting generateScheduleFlow");
    return output!;
  }
);
