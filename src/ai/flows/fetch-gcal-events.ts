'use server';
/**
 * @fileOverview A flow to fetch Google Calendar events using a configured API key and calendar ID from environment variables.
 *
 * - fetchGoogleCalendarEvents - Fetches Google Calendar events.
 * - FetchGoogleCalendarEventsInput - The input type for the fetchGoogleCalendarEvents function.
 * - FetchedGcalEventOutput - The type for the array of fetched Google Calendar events.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { addDays, parseISO } from 'date-fns';
import { CalendarEventSchema } from '@/ai/schemas/common';

export const getGoogleCalendarEventsTool = ai.defineTool(
  {
    name: 'getGoogleCalendarEvents',
    description: 'Fetches Google Calendar events for the user for the next 7 days. Reads API key and Calendar ID from environment variables.',
    inputSchema: z.object({
      startDate: z.string().date().describe('The start date for fetching events (YYYY-MM-DD).'),
    }),
    outputSchema: z.array(CalendarEventSchema),
  },
  async ({ startDate }) => {
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const apiKeyFromEnv = process.env.GOOGLE_CALENDAR_API_KEY;

    if (apiKeyFromEnv === 'DEMO_GCAL_KEY') {
      console.log(`Simulating GCal fetch for calendar: ${calendarId} using DEMO_GCAL_KEY.`);
      const start = parseISO(startDate);
      
      const event1StartDate = addDays(start, 1);
      const event1Start = new Date(event1StartDate.getFullYear(), event1StartDate.getMonth(), event1StartDate.getDate(), 10, 0, 0);
      const event1End = new Date(event1Start.getTime() + 60 * 60 * 1000); // 1 hour later

      const event2StartDate = addDays(start, 3);
      const event2Start = new Date(event2StartDate.getFullYear(), event2StartDate.getMonth(), event2StartDate.getDate(), 14, 0, 0);
      const event2End = new Date(event2Start.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      return [
        {
          name: 'Team Sync (Demo Event)',
          startTime: event1Start.toISOString(),
          endTime: event1End.toISOString(),
          link: 'https://calendar.google.com'
        },
        {
          name: 'Project Planning (Demo Event)',
          startTime: event2Start.toISOString(),
          endTime: event2End.toISOString(),
          link: 'https://calendar.google.com'
        },
      ];
    }
    
    if (!apiKeyFromEnv) {
        throw new Error("Google Calendar API key (GOOGLE_CALENDAR_API_KEY) is not set in the .env file. Cannot fetch events.");
    }
    
    try {
        const start = parseISO(startDate);
        const timeMin = start.toISOString();
        const timeMax = addDays(start, 7).toISOString();

        const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId!)}/events`);
        url.searchParams.append('key', apiKeyFromEnv);
        url.searchParams.append('timeMin', timeMin);
        url.searchParams.append('timeMax', timeMax);
        url.searchParams.append('singleEvents', 'true');
        url.searchParams.append('orderBy', 'startTime');

        const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            let errorBody = 'Could not retrieve error details.';
            let errorJson: any;
            try {
                errorJson = await response.json();
                errorBody = errorJson.error?.message || JSON.stringify(errorJson);
            } catch (e) {
                // ignore if can't parse error body
            }

            if (response.status === 403) {
                 if (errorJson?.error?.errors?.[0]?.reason === 'accessNotConfigured') {
                    throw new Error(`Google Calendar API access is not configured. Please ensure the Calendar API is enabled in your Google Cloud project and the API key is correct.`);
                 }
                 throw new Error(`Google Calendar request failed with status 403 (Forbidden). Please check your GOOGLE_CALENDAR_API_KEY and its permissions.`);
            }

            if (response.status === 404) {
                throw new Error(`Google Calendar not found (404). This usually means the calendar with ID '${calendarId}' is not shared publicly. For API Key access, please go to your Google Calendar settings for this specific calendar and ensure that 'Access permissions for events' is set to 'Make available to public'.`);
            }

            throw new Error(`Google Calendar API request failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        
        if (!data.items) {
            return [];
        }

        return data.items
          .filter((event:any) => event.status !== 'cancelled')
          .map((event: any) => ({
            name: event.summary || 'No Title',
            startTime: event.start?.dateTime || event.start?.date,
            endTime: event.end?.dateTime || event.end?.date,
            link: event.htmlLink,
        }));

    } catch (apiError) {
        console.error("Google Calendar API call failed:", apiError);
        if (apiError instanceof Error) {
            throw apiError;
        }
        throw new Error("An unknown error occurred during the Google Calendar API call. Check server logs.");
    }
  }
);


const FetchGoogleCalendarEventsInputSchema = z.object({
    startDate: z.string().date(),
});
export type FetchGoogleCalendarEventsInput = z.infer<typeof FetchGoogleCalendarEventsInputSchema>;

const FetchedGcalEventOutputSchema = z.array(CalendarEventSchema);
export type FetchedGcalEventOutput = z.infer<typeof FetchedGcalEventOutputSchema>;

export async function fetchGoogleCalendarEvents(input: FetchGoogleCalendarEventsInput): Promise<FetchedGcalEventOutput> {
  return fetchGoogleCalendarEventsFlow(input);
}

const fetchGoogleCalendarEventsFlow = ai.defineFlow(
  {
    name: 'fetchGoogleCalendarEventsFlow',
    inputSchema: FetchGoogleCalendarEventsInputSchema,
    outputSchema: FetchedGcalEventOutputSchema,
  },
  async (input) => { 
    try {
      const events = await getGoogleCalendarEventsTool(input);
      return events;
    } catch (e) {
      console.error("Error fetching Google Calendar events via flow:", e);
      if (e instanceof Error) {
        // Re-throw the error so the UI can display it in a toast.
        throw e;
      }
      throw new Error("An unknown error occurred while fetching Google Calendar events. Check server logs and .env configuration.");
    }
  }
);
