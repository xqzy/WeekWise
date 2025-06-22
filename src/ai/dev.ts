
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-schedule.ts';
import '@/ai/flows/learn-schedule-patterns.ts';
import '@/ai/flows/fetch-jira-tasks.ts';
import '@/ai/flows/fetch-gcal-events.ts';
