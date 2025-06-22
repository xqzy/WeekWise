
'use server';
/**
 * @fileOverview A flow to fetch Jira tasks using configured environment credentials.
 *
 * - fetchJiraTasks - Fetches Jira tasks.
 * - FetchedJiraTaskOutput - The type for the array of fetched Jira tasks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { JiraTaskSchema } from '@/ai/schemas/common'; 
import { format, addDays, subDays } from 'date-fns';

const getJiraTasksTool = ai.defineTool(
  {
    name: 'getJiraTasks',
    description: 'Fetches Jira tasks for the user based on environment configuration (JIRA_USER_EMAIL, JIRA_API_KEY, JIRA_INSTANCE_URL, JIRA_PROJECT_KEY). JIRA_PROJECT_KEY can be a comma-separated list of keys.',
    inputSchema: z.object({}), 
    outputSchema: z.array(JiraTaskSchema),
  },
  async () => {
    const userEmail = process.env.JIRA_USER_EMAIL;
    const apiKey = process.env.JIRA_API_KEY;
    const instanceUrl = process.env.JIRA_INSTANCE_URL?.replace(/\/+$/, ''); // Remove trailing slashes
    const projectKeys = process.env.JIRA_PROJECT_KEY?.split(',').map(k => k.trim());

    if (apiKey === 'DEMO_JIRA_KEY') {
      const demoInstance = instanceUrl || 'https://jira.example.com';
      const today = new Date();
      return [
        { name: `[KAN] Design new dashboard (Demo Task)`, link: `${demoInstance}/browse/KAN-101`, deadline: format(addDays(today, 5), 'yyyy-MM-dd'), projectKey: 'KAN' },
        { name: `[KAN] Implement login feature (Demo Task)`, link: `${demoInstance}/browse/KAN-102`, deadline: format(addDays(today, 2), 'yyyy-MM-dd'), projectKey: 'KAN' },
        { name: `[SZH] Write API documentation (OVERDUE Demo Task)`, link: `${demoInstance}/browse/SZH-103`, deadline: format(subDays(today, 3), 'yyyy-MM-dd'), projectKey: 'SZH' },
        { name: `[SZH] Deploy to staging (Demo Task)`, link: `${demoInstance}/browse/SZH-104`, projectKey: 'SZH' }, // No deadline
      ];
    }

    if (!userEmail || !apiKey || !instanceUrl || !projectKeys || projectKeys.length === 0) {
        console.warn("Jira environment variables (JIRA_USER_EMAIL, JIRA_API_KEY, JIRA_INSTANCE_URL, JIRA_PROJECT_KEY) are not fully set in .env. Cannot fetch Jira tasks.");
        return []; // Return empty if not fully configured for real fetch
    }
    
    console.log(`Attempting to fetch Jira tasks from ${instanceUrl} for projects: ${projectKeys.join(', ')}.`);
    
    try {
      const auth = `Basic ${Buffer.from(`${userEmail}:${apiKey}`).toString('base64')}`;
      const jql = `project in (${projectKeys.map(k => `"${k}"`).join(',')}) AND status != "DONE" ORDER BY created DESC`;
      const apiUrl = `${instanceUrl}/rest/api/latest/search?jql=${encodeURIComponent(jql)}&fields=summary,key,duedate`;
      
      const response = await fetch(apiUrl, { 
        headers: { 
          Authorization: auth, 
          'Accept': 'application/json' 
        }
      });

      if (!response.ok) {
        let errorBody = 'Could not retrieve error details.';
        let errorJson: any;
        try {
            errorJson = await response.json();
            if (errorJson.errorMessages && errorJson.errorMessages.length > 0) {
                 errorBody = errorJson.errorMessages.join(' ');
            } else {
                 errorBody = JSON.stringify(errorJson);
            }
        } catch (e) {
            try {
              errorBody = await response.text();
            } catch (readError) {
              // ignore if can't parse error body
            }
        }

        if (response.status === 401 || response.status === 403) {
            throw new Error(`Jira Authentication Failed (Status: ${response.status}). Please check your JIRA_USER_EMAIL and JIRA_API_KEY in the .env file.`);
        }
        
        if (response.status === 400) {
             throw new Error(`Jira Configuration Error: ${errorBody}. Please check your JIRA_PROJECT_KEY ('${projectKeys.join(',')}') and JIRA_INSTANCE_URL.`);
        }
        
        throw new Error(`Jira API request failed with status ${response.status}: ${response.statusText}. Details: ${errorBody}. Check instance URL, project key(s), email, and API key/permissions.`);
      }

      const data = await response.json();

      if (!data.issues) {
         throw new Error(`Jira API response did not contain 'issues'. Response: ${JSON.stringify(data)}`);
      }

      return data.issues.map((issue: any) => ({ 
         name: `[${issue.key}] ${issue.fields.summary}`, 
         link: `${instanceUrl}/browse/${issue.key}`,
         deadline: issue.fields.duedate || undefined, // Jira returns null for no deadline, convert to undefined for Zod schema
         projectKey: issue.key.split('-')[0],
      }));

    } catch (apiError) {
      console.error("Jira API call failed:", apiError);
      if (apiError instanceof Error) {
        throw apiError;
      }
      throw new Error("An unknown error occurred during the Jira API call. Check server logs.");
    }
  }
);


const FetchJiraTasksOutputSchema = z.array(JiraTaskSchema);
export type FetchedJiraTaskOutput = z.infer<typeof FetchJiraTasksOutputSchema>;

export async function fetchJiraTasks(): Promise<FetchedJiraTaskOutput> {
  return fetchJiraTasksFlow({});
}

const fetchJiraTasksFlow = ai.defineFlow(
  {
    name: 'fetchJiraTasksFlow',
    inputSchema: z.object({}), 
    outputSchema: FetchJiraTasksOutputSchema,
  },
  async () => { 
    try {
      const tasks = await getJiraTasksTool({});
      return tasks;
    } catch (e) {
      console.error("Error fetching Jira tasks via flow:", e);
      if (e instanceof Error) {
        throw e;
      }
      throw new Error("An unknown error occurred while fetching Jira tasks. Check server logs and Jira .env configuration.");
    }
  }
);
