
"use client";

import { useState, useEffect } from "react";
import type {
  JiraTaskInput,
  CalendarEventInput,
  UnavailableHour,
  ScheduledItem,
  GroupedSchedule,
  LearningInput,
  DayOfWeek,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info, Loader2, CalendarCheck2, KeyRound, DownloadCloud } from "lucide-react";
import JiraTaskForm from "@/components/dashboard/JiraTaskForm";
import CalendarEventForm from "@/components/dashboard/CalendarEventForm";
import UnavailableHoursForm from "@/components/dashboard/UnavailableHoursForm";
import WeekCalendar from "@/components/dashboard/WeekCalendar";
import LearnPatternDialog from "@/components/dashboard/LearnPatternDialog";
import { generateSchedule } from "@/ai/flows/generate-schedule";
import type { GenerateScheduleInput } from "@/ai/flows/generate-schedule";
import { fetchJiraTasks } from "@/ai/flows/fetch-jira-tasks";
import { fetchGoogleCalendarEvents } from "@/ai/flows/fetch-gcal-events";
import { learnSchedulePatterns } from "@/ai/flows/learn-schedule-patterns";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

const defaultUnavailableHours: UnavailableHour[] = [
    { id: 'mon-default', dayOfWeek: 'Monday', startTime: '08:00', endTime: '19:00' },
    { id: 'tue-default', dayOfWeek: 'Tuesday', startTime: '07:00', endTime: '21:00' },
    { id: 'wed-default', dayOfWeek: 'Wednesday', startTime: '07:00', endTime: '22:00' },
    { id: 'thu-default', dayOfWeek: 'Thursday', startTime: '08:00', endTime: '21:00' },
    { id: 'fri-default', dayOfWeek: 'Friday', startTime: '08:00', endTime: '13:00' },
];

export default function DashboardPage() {
  const [jiraTasks, setJiraTasks] = useState<JiraTaskInput[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventInput[]>([]);
  const [unavailableHours, setUnavailableHours] = useState<UnavailableHour[]>(defaultUnavailableHours);
  const [generatedSchedule, setGeneratedSchedule] = useState<GroupedSchedule>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingJira, setIsFetchingJira] = useState(false);
  const [isFetchingGcal, setIsFetchingGcal] = useState(false);
  const [isLearnPatternDialogOpen, setIsLearnPatternDialogOpen] = useState(false);
  const [selectedItemForLearning, setSelectedItemForLearning] = useState<ScheduledItem | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const { toast } = useToast();

  const handleFetchJiraTasks = async () => {
    setIsFetchingJira(true);
    try {
      const fetchedTasks = await fetchJiraTasks();
      const mappedTasks: JiraTaskInput[] = fetchedTasks.map(task => ({
        id: crypto.randomUUID(),
        name: task.name,
        link: task.link,
        deadline: task.deadline,
        projectKey: task.projectKey,
      }));
      setJiraTasks(mappedTasks);
      toast({
        title: "Jira Tasks Fetched",
        description: `Successfully fetched ${mappedTasks.length} tasks from Jira.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error fetching Jira tasks:", error);
      toast({
        title: "Error Fetching Jira Tasks",
        description: (error as Error).message || "Could not fetch Jira tasks. Check .env configuration, Jira credentials, and server logs.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingJira(false);
    }
  };

  const handleFetchGcalEvents = async () => {
    setIsFetchingGcal(true);
    try {
      const fetchedEvents = await fetchGoogleCalendarEvents({
        startDate: format(currentDate, "yyyy-MM-dd"),
      });

      const mappedEvents: CalendarEventInput[] = fetchedEvents.map(event => ({
        id: crypto.randomUUID(),
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime,
        link: event.link,
      }));
      setCalendarEvents(mappedEvents);
      toast({
        title: "Google Calendar Events Fetched",
        description: `Successfully fetched ${mappedEvents.length} events.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
      toast({
        title: "Error Fetching GCal Events",
        description: (error as Error).message || "Could not fetch Google Calendar events. Check .env configuration and server logs.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingGcal(false);
    }
  };


  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    setGeneratedSchedule({});

    const aiInput: GenerateScheduleInput = {
      currentDate: format(currentDate, "yyyy-MM-dd"),
      manualJiraTasks: jiraTasks.map(task => ({ 
        name: task.name, 
        link: task.link,
        deadline: task.deadline,
        projectKey: task.projectKey,
      })),
      manualCalendarEvents: calendarEvents.map(event => ({
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime,
        link: event.link,
      })),
      unavailableHours: unavailableHours.map(uh => ({
        dayOfWeek: uh.dayOfWeek,
        startTime: uh.startTime,
        endTime: uh.endTime,
      })),
    };

    try {
      const result = await generateSchedule(aiInput);
      if (result && result.schedule) {
        const grouped = result.schedule.reduce((acc, item) => {
          const itemDate = parseISO(item.startTime);
          const dayKey = format(itemDate, "yyyy-MM-dd");
          if (!acc[dayKey]) {
            acc[dayKey] = [];
          }
          const originalJiraTask = jiraTasks.find(jt => jt.name === item.name && item.type === 'jira');
          acc[dayKey].push({ ...item, originalId: originalJiraTask?.id });
          return acc;
        }, {} as GroupedSchedule);
        setGeneratedSchedule(grouped);
        toast({
          title: "Schedule Generated",
          description: "Your 7-day schedule has been successfully created.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error Generating Schedule",
          description: "The AI could not generate a schedule. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast({
        title: "Error Generating Schedule",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLearnDialog = (item: ScheduledItem) => {
    if (item.type === 'jira') {
      setSelectedItemForLearning(item);
      setIsLearnPatternDialogOpen(true);
    }
  };

  const handleSubmitFeedback = async (feedback: LearningInput) => {
    try {
      const result = await learnSchedulePatterns(feedback);
      toast({
        title: result.success ? "Feedback Received" : "Feedback Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error Submitting Feedback",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-2 flex items-center justify-between md:justify-start">
           <span className="font-semibold text-lg p-2 hidden group-data-[collapsible=icon]:hidden md:inline-flex">Inputs & Settings</span>
           <div className="md:hidden ml-auto">
             <SidebarTrigger />
           </div>
        </SidebarHeader>
        <ScrollArea className="flex-1 px-2">
          <SidebarContent className="py-2 space-y-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <Button onClick={handleFetchJiraTasks} disabled={isFetchingJira} className="w-full mb-2">
                  {isFetchingJira ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="mr-2 h-4 w-4" />}
                  Fetch Jira Tasks
                </Button>
                <JiraTaskForm tasks={jiraTasks} setTasks={setJiraTasks} />
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                 <Button onClick={handleFetchGcalEvents} disabled={isFetchingGcal} className="w-full mb-2">
                  {isFetchingGcal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadCloud className="mr-2 h-4 w-4" />}
                  Fetch GCal Events
                </Button>
                <CalendarEventForm events={calendarEvents} setEvents={setCalendarEvents} />
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <UnavailableHoursForm unavailableHours={unavailableHours} setUnavailableHours={setUnavailableHours} />
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
               <SidebarGroupLabel className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <KeyRound size={14}/> Account Connections
                </SidebarGroupLabel>
              <SidebarGroupContent>
                <Card className="bg-secondary/30">
                  <CardContent className="p-3 text-xs text-muted-foreground space-y-3">
                    <p><strong>Jira:</strong> Configure `JIRA_USER_EMAIL`, `JIRA_API_KEY`, `JIRA_INSTANCE_URL`, and `JIRA_PROJECT_KEY` in your `.env` file. `JIRA_PROJECT_KEY` can be a comma-separated list (e.g., "KAN,SZH"). Use `JIRA_API_KEY=DEMO_JIRA_KEY` for sample data.</p>
                    <p><strong>Google Calendar:</strong> Configure `GOOGLE_CALENDAR_API_KEY` and `GOOGLE_CALENDAR_ID` in your `.env` file. Use `...=DEMO_..._KEY` for sample data. The Calendar ID is often your email address, and the calendar must be public.</p>
                  </CardContent>
                </Card>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </ScrollArea>
      </Sidebar>

      <SidebarInset className="flex-1 flex flex-col p-4 md:p-6 bg-background">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-headline font-bold">Your 7-Day Plan</h1>
            <p className="text-muted-foreground">AI-generated schedule balancing tasks and events.</p>
          </div>
          <Button
            onClick={handleGenerateSchedule}
            disabled={isLoading}
            size="lg"
            className="w-full md:w-auto shadow-md hover:shadow-primary/40"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CalendarCheck2 className="mr-2 h-5 w-5" />
            )}
            Generate Schedule
          </Button>
        </div>

        {Object.keys(generatedSchedule).length > 0 ? (
          <WeekCalendar schedule={generatedSchedule} onOpenLearnDialog={handleOpenLearnDialog} currentDate={currentDate} />
        ) : (
          <Card className="flex-1 flex items-center justify-center shadow-lg border-dashed">
            <CardContent className="text-center p-10">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Schedule Generated Yet</h3>
              <p className="text-muted-foreground">
                Fetch or add Jira tasks, configure Google Calendar in `.env` (use DEMO_GCAL_KEY for sample data), then click "Generate Schedule".
              </p>
            </CardContent>
          </Card>
        )}
      </SidebarInset>

      {selectedItemForLearning && (
        <LearnPatternDialog
          isOpen={isLearnPatternDialogOpen}
          onOpenChange={setIsLearnPatternDialogOpen}
          item={selectedItemForLearning}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}
    </>
  );
}
