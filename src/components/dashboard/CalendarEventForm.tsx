"use client";

import type { CalendarEventInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusCircle, CalendarDays } from "lucide-react";
import { useState } from "react";

interface CalendarEventFormProps {
  events: CalendarEventInput[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEventInput[]>>;
}

export default function CalendarEventForm({ events, setEvents }: CalendarEventFormProps) {
  const [newEventName, setNewEventName] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [newEventLink, setNewEventLink] = useState("");

  const handleAddEvent = () => {
    if (
      newEventName.trim() === "" ||
      newEventStartTime.trim() === "" ||
      newEventEndTime.trim() === ""
    ) return;
    
    // Basic validation for datetime-local format or ISO
    const isValidDateTime = (dt: string) => {
      return !isNaN(new Date(dt).getTime());
    }

    if (!isValidDateTime(newEventStartTime) || !isValidDateTime(newEventEndTime)) {
      alert("Please enter valid start and end times.");
      return;
    }
    
    if (new Date(newEventStartTime) >= new Date(newEventEndTime)) {
      alert("End time must be after start time.");
      return;
    }

    setEvents([
      ...events,
      {
        id: crypto.randomUUID(),
        name: newEventName,
        startTime: new Date(newEventStartTime).toISOString(),
        endTime: new Date(newEventEndTime).toISOString(),
        link: newEventLink.trim() !== "" ? newEventLink : undefined,
      },
    ]);
    setNewEventName("");
    setNewEventStartTime("");
    setNewEventEndTime("");
    setNewEventLink("");
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center">
          <CalendarDays className="mr-2 h-5 w-5 text-accent" /> Google Calendar Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-name">Event Name</Label>
          <Input
            id="event-name"
            placeholder="e.g., Team Meeting"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="event-start-time">Start Time</Label>
            <Input
              id="event-start-time"
              type="datetime-local"
              value={newEventStartTime}
              onChange={(e) => setNewEventStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-end-time">End Time</Label>
            <Input
              id="event-end-time"
              type="datetime-local"
              value={newEventEndTime}
              onChange={(e) => setNewEventEndTime(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-link">Event Link (Optional)</Label>
          <Input
            id="event-link"
            type="url"
            placeholder="e.g., https://meet.google.com/xyz-abc-def"
            value={newEventLink}
            onChange={(e) => setNewEventLink(e.target.value)}
          />
        </div>
        <Button onClick={handleAddEvent} className="w-full" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Calendar Event
        </Button>
        {events.length > 0 && (
          <div className="space-y-2 pt-4">
            <h4 className="font-medium text-sm">Current Events:</h4>
            <ul className="space-y-2 max-h-40 overflow-y-auto rounded-md border p-2">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between p-2 bg-secondary/50 rounded-md text-sm"
                >
                  <a href={event.link} target="_blank" rel="noopener noreferrer" className="hover:underline truncate" title={event.name}>
                    {event.name}
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEvent(event.id)}
                    aria-label={`Remove event ${event.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
