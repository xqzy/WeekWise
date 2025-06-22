
export interface JiraTaskInput {
  id: string; 
  name: string;
  link: string;
  deadline?: string; // YYYY-MM-DD
  projectKey: string;
}

export interface CalendarEventInput {
  id: string; 
  name: string;
  startTime: string; 
  endTime: string; 
  link?: string;
}

export interface UnavailableHour {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface ScheduledItem {
  name: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  link?: string;
  type: 'jira' | 'calendar';
  originalId?: string; // To link back to original Jira task for learning
  projectKey?: string; // e.g., 'KAN' or 'SZH'
  deadline?: string; // YYYY-MM-DD
}

export interface GroupedSchedule {
  [date: string]: ScheduledItem[]; // date as "YYYY-MM-DD"
}

export interface LearningInput {
  jiraItemId: string; 
  estimatedTime: number; // Fixed at 1 hour
  actualTime: number;
  manualAdjustments?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const ALL_DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
