"use client";

import type { UnavailableHour, DayOfWeek } from "@/types";
import { ALL_DAYS_OF_WEEK } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, PlusCircle, ShieldAlert } from "lucide-react";
import { useState } from "react";

interface UnavailableHoursFormProps {
  unavailableHours: UnavailableHour[];
  setUnavailableHours: React.Dispatch<React.SetStateAction<UnavailableHour[]>>;
}

export default function UnavailableHoursForm({ unavailableHours, setUnavailableHours }: UnavailableHoursFormProps) {
  const [newDay, setNewDay] = useState<DayOfWeek>('Monday');
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("17:00");

  const handleAddUnavailableHour = () => {
    if (newStartTime.trim() === "" || newEndTime.trim() === "") return;

    // Basic time format validation HH:mm
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newStartTime) || !timeRegex.test(newEndTime)) {
        alert("Please use HH:mm format for times (e.g., 09:00 or 14:30).");
        return;
    }
    
    const [startH, startM] = newStartTime.split(':').map(Number);
    const [endH, endM] = newEndTime.split(':').map(Number);

    if (startH > endH || (startH === endH && startM >= endM)) {
        alert("End time must be after start time.");
        return;
    }

    setUnavailableHours([
      ...unavailableHours,
      { id: crypto.randomUUID(), dayOfWeek: newDay, startTime: newStartTime, endTime: newEndTime },
    ]);
  };

  const handleRemoveUnavailableHour = (id: string) => {
    setUnavailableHours(unavailableHours.filter((hour) => hour.id !== id));
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-headline flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5 text-accent" /> Unavailable Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="day-of-week">Day of Week</Label>
          <Select value={newDay} onValueChange={(value) => setNewDay(value as DayOfWeek)}>
            <SelectTrigger id="day-of-week">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {ALL_DAYS_OF_WEEK.map(day => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unavailable-start-time">Start Time (HH:mm)</Label>
            <Input
              id="unavailable-start-time"
              type="time"
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unavailable-end-time">End Time (HH:mm)</Label>
            <Input
              id="unavailable-end-time"
              type="time"
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleAddUnavailableHour} className="w-full" variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Unavailable Slot
        </Button>
        {unavailableHours.length > 0 && (
          <div className="space-y-2 pt-4">
            <h4 className="font-medium text-sm">Current Slots:</h4>
            <ul className="space-y-2 max-h-40 overflow-y-auto rounded-md border p-2">
              {unavailableHours.map((hour) => (
                <li
                  key={hour.id}
                  className="flex items-center justify-between p-2 bg-secondary/50 rounded-md text-sm"
                >
                  <span>
                    {hour.dayOfWeek}: {hour.startTime} - {hour.endTime}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveUnavailableHour(hour.id)}
                    aria-label={`Remove slot for ${hour.dayOfWeek} from ${hour.startTime} to ${hour.endTime}`}
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
