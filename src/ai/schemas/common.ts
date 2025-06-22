
import { z } from 'zod';

export const JiraTaskSchema = z.object({
  name: z.string(),
  link: z.string().url(),
  deadline: z.string().optional().describe('The due date of the task in YYYY-MM-DD format.'),
  projectKey: z.string().describe('The project key of the task, e.g., "KAN".'),
});

export const CalendarEventSchema = z.object({
  name: z.string(),
  startTime: z.string(), // ISO string
  endTime: z.string(), // ISO string
  link: z.string().url().optional(),
});

// Other common schemas can be added here in the future
